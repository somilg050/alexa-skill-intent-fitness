/* eslint-disable  func-names */
/* eslint-disable  no-console */
 
const Alexa = require('ask-sdk-core');
//const ddbAdapter = require('ask-sdk-dynamodb-persistence-adapter');

const Script = require('./Script.js');

var RandomInt = (min, max) => {
  return Math.floor(Math.random()*(max-min+1)+min);
};
 
var i;
var flag=false;
var last;
	
const LaunchRequestHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'LaunchRequest';
  },
  handle(handlerInput) {
    const speechText = `Welcome to Intent Fitness, the fun way to train both your mind and your body. 
    You can ask for an interesting fitness fact or start your fitness journey. What would you like to do?`;
    var SessionAttributes = handlerInput.attributesManager.getSessionAttributes();
 
    SessionAttributes.Last = speechText;
 
    return handlerInput.responseBuilder
      .speak(speechText)
      .withShouldEndSession(false)
      .getResponse();
  },
};
  
const FitnessJourneyIntent = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'FitnessJourney';
  },
  async handle(handlerInput) {
    var SessionAttributes = handlerInput.attributesManager.getSessionAttributes();
    var speechText = '';
 
    speechText = `Let's get you started on your fitness journey! 
    The game goes like this, we ask 5 questions from the category of your choice.
    Based on your score out of 5, we set the difficulty level of your exercise.
    We help you utilize your break between different exercises and use it to train your mind.
    Excited? Tell us a category to start.`;
    
    SessionAttributes.Last = speechText;
    
    return handlerInput.responseBuilder
      .speak(speechText)
      .withShouldEndSession(false)
      .getResponse();
  },
};

const WorkoutIntent = {
    canHandle(handlerInput) {
      //var SessionAttributes = handlerInput.attributesManager.getSessionAttributes();
      return handlerInput.requestEnvelope.request.type === 'IntentRequest'
        && (handlerInput.requestEnvelope.request.intent.name === 'Workout' || flag );
    },
    async handle(handlerInput) {
      var SessionAttributes = handlerInput.attributesManager.getSessionAttributes();
      //var PersistenceAttributes = await handlerInput.attributesManager.getPersistentAttributes();
      
      var speechText ='';
      var Keys = Object.keys(Script);
      var len = 2;
      var index = RandomInt(0,len);
      var exercise = Keys[index];
      var score = SessionAttributes.Score;
      console.log(score);
      var level = 0;
      if (score == 3){
        level = 1;
      }
      if (score <3){
        level = 2;
      }
      speechText = Script[exercise][level].dialog;
      speechText += `Great job! Eighter continue with the same category or tell me a different category.`;

      SessionAttributes.Last = speechText;
      
      return handlerInput.responseBuilder
        .speak(speechText)
        .withShouldEndSession(false)
        .getResponse();
    },
  };

  const ChangeCategoryIntent = {
    canHandle(handlerInput) {
      return handlerInput.requestEnvelope.request.type === 'IntentRequest'
        && (handlerInput.requestEnvelope.request.intent.name === 'ChangeCategory');
    },
    async handle(handlerInput) {
      var SessionAttributes = handlerInput.attributesManager.getSessionAttributes();

      var speechText = `Looks like you want to change the category of questions. Tell me what category you want?`;

      SessionAttributes.Last = speechText;
      
      return handlerInput.responseBuilder
        .speak(speechText)
        .withShouldEndSession(false)
        .getResponse();
    },
  };
 
var map;
 
async function askQuestion(handlerInput) {
  const SessionAttributes = handlerInput.attributesManager.getSessionAttributes();
  SessionAttributes.AnswerAwaiting = true;
  var ques, ans;
  var URL = SessionAttributes.URL;
  var data;
  if(!SessionAttributes.hasOwnProperty('Data')){
    await getRemoteData(URL)
    .then((response) => {
      data = JSON.parse(response);
      i = 0;
    });
  }
  ques = data.results[i%5].question;
  ans = data.results[i%5].correct_answer;
  var options = data.results[i%5].incorrect_answers;
  options[options.length] = ans;
  SessionAttributes.Options = options;
  SessionAttributes.PrevAnswer = ans;
  SessionAttributes.Data = data;
  i++;
  SessionAttributes.Count = i;
  
  var speechText = ques;
  var choice = RandomInt(0,3);
  map = new Object();
 
  map[options[choice%4]] = 'option one';
  map[options[(choice+1)%4]] = 'option two';
  map[options[(choice+2)%4]] = 'option three';
  map[options[(choice+3)%4]] = 'option four';
  console.log(map);
 
  speechText += ` Your Options are: option A - ${options[choice%4]}, option B - ${options[(choice+1)%4]}, 
                option C - ${options[(choice+2)%4]}, option D - ${options[(choice+3)%4]} `;
 
  handlerInput.attributesManager.setSessionAttributes(SessionAttributes);
  SessionAttributes.Last = speechText;
  return speechText;
}
 
const QuizIntent = {
  canHandle(handlerInput) {
    var request = handlerInput.requestEnvelope.request;
    return request.type === 'IntentRequest' && !(request.intent.name === 'FitnessJourney')
      && request.intent.name === 'QuizIntent';
  },
  async handle(handlerInput) {
    var speechText = '';
    var request = handlerInput.requestEnvelope.request;
    var SessionAttributes = handlerInput.attributesManager.getSessionAttributes();
    SessionAttributes.AnswerAwaiting = false;
    SessionAttributes.Score = 0;
    var endSession =false;
    if(request.intent.name === 'AMAZON.StopIntent' || request.intent.name === 'AMAZON.CancelIntent'){
      return CancelAndStopIntentHandler.handle(handlerInput);
    }
 
    var URL = `https://opentdb.com/api.php?amount=5&difficulty=easy&type=multiple`;
    var categorySlot;
    if(handlerInput.requestEnvelope
      && handlerInput.requestEnvelope.request
      && handlerInput.requestEnvelope.request.intent
      && handlerInput.requestEnvelope.request.intent.slots
      && handlerInput.requestEnvelope.request.intent.slots.category
      && handlerInput.requestEnvelope.request.intent.slots.category.resolutions
      && handlerInput.requestEnvelope.request.intent.slots.category.resolutions.resolutionsPerAuthority[0]
      && (handlerInput.requestEnvelope.request.intent.slots.category.resolutions.resolutionsPerAuthority[0].status.code === "ER_SUCCESS_MATCH")){
      categorySlot = handlerInput.requestEnvelope.request.intent.slots['category'].value;
      let categoryId = handlerInput.requestEnvelope.request.intent.slots.category.resolutions.resolutionsPerAuthority[0].values[0].value.id;
      if(categoryId != 0){
        speechText = `Here are your questions in ${categorySlot} category!! `;
        URL+=`&category=${categoryId}`;
      }
      else{
        speechText = `Here we go!! `;
      }
    }
    else{
      speechText = `Sorry, we don't have that category. Try something like movie, music, sports. `;
      return handlerInput.responseBuilder
      .speak(speechText)
      .withShouldEndSession(endSession)
      .getResponse();
    }
    if(!flag){
      speechText += `For each questions reply with A, B, C or D. `;
      flag = true;
    }
    SessionAttributes.URL = URL;
    var ques = await askQuestion(handlerInput);
    speechText += ques;
    SessionAttributes.Last = speechText;
 
    return handlerInput.responseBuilder
      .speak(speechText)
      .withShouldEndSession(endSession)
      .getResponse();
  },
};
 
const AnswerIntent = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    const SessionAttributes = handlerInput.attributesManager.getSessionAttributes();
    
    return request.type === 'IntentRequest' 
    && request.intent.name ==='AnswerIntent'
    && SessionAttributes.AnswerAwaiting;
  },
  async handle(handlerInput) {
    var endSession = false;
    const SessionAttributes = handlerInput.attributesManager.getSessionAttributes();
    const request = handlerInput.requestEnvelope.request;
    const answerSlot = request.intent.slots.answer.resolutions.resolutionsPerAuthority[0].values[0].value.name;
 
    const prevAnswer = SessionAttributes.PrevAnswer;
    var speakOutput;
    console.log(answerSlot);
    console.log(map[prevAnswer]);
 
    
    // if(map[prevAnswer] == answerSlot) {
    //   speakOutput = "That answer is correct. ";
    //   SessionAttributes.Score += 1;
    // }
    // else{
    //   speakOutput = "That answer is wrong. ";
    // }
    if(SessionAttributes.Count<5){
      var intm = await askQuestion(handlerInput);
      speakOutput += intm; 
      SessionAttributes.Last=intm;
    }
    else{
      speakOutput += `Bye Bye`;
      endSession = true;
    }
    
    handlerInput.attributesManager.setSessionAttributes(SessionAttributes);
    last=speakOutput;
    SessionAttributes.Last = last;
 
    return handlerInput.responseBuilder
      .speak(speakOutput)
      .reprompt(speakOutput)
      .withShouldEndSession(endSession)
      .getResponse();
  }
};
 
const CancelAndStopIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && (handlerInput.requestEnvelope.request.intent.name === 'AMAZON.CancelIntent'
        || handlerInput.requestEnvelope.request.intent.name === 'AMAZON.StopIntent');
  },
  handle(handlerInput) {
    const speechText = `Cancel And Stop Intent Handler`;
 
    return handlerInput.responseBuilder
      .speak(speechText)
      .withShouldEndSession(true)
      .getResponse();
  },
};
 
const FallBackHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'AMAZON.FallbackIntent';
  },
  handle(handlerInput) {
    var speechText ="Fallback Intent";
    var SessionAttributes = handlerInput.attributesManager.getSessionAttributes();
    SessionAttributes.Last = speechText;
    return handlerInput.responseBuilder
      .speak(speechText)
      .reprompt(speechText)
      .getResponse();
  },
};
 
const HelpIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'AMAZON.HelpIntent';
  },
  handle(handlerInput) {
    const speechText = `HELP`;
    const SessionAttributes = handlerInput.attributesManager.getSessionAttributes();
    SessionAttributes.Last = speechText;
    
    return handlerInput.responseBuilder
      .speak(speechText)
      .reprompt(speechText)
      .getResponse();
  },
};
 
const RepeatHandler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'IntentRequest' && (request.intent.name === 'AMAZON.RepeatIntent');
  },
  handle(handlerInput) {
    const SessionAttributes = handlerInput.attributesManager.getSessionAttributes();
    var speechOutput = SessionAttributes.Last;
    return handlerInput.responseBuilder
      .speak(speechOutput)
      .withShouldEndSession(false)
      .getResponse();
  },
};
 
const SessionEndedRequestHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'SessionEndedRequest';
  },
  handle(handlerInput) {
    console.log(`Session ended with reason: ${handlerInput.requestEnvelope.request.reason}`);
 
    return handlerInput.responseBuilder
    .speak(`Session Ended`)
    .withShouldEndSession(true)
    .getResponse();
  },
};
 
const ErrorHandler = {
  canHandle() {
    return true;
  },
  handle(handlerInput, error) {
    console.log(`Error handled: ${error.message}`);
 
    return handlerInput.responseBuilder
      .speak(`Error`)
      .withShouldEndSession(true)
      .getResponse();
  },
};
 
// function getPersistenceAdapter(tableName) {
//   // Not in Alexa Hosted Environment
//   return new ddbAdapter.DynamoDbPersistenceAdapter({
//     tableName: tableName,
//     createTable: true
//   });
// }
 
const getRemoteData = function (url) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? require('https') : require('http');
    const request = client.get(url, (response) => {
      if (response.statusCode < 200 || response.statusCode > 299) {
        reject(new Error('Failed with status code: ' + response.statusCode));
      }
      const body = [];
      response.on('data', (chunk) => body.push(chunk));
      response.on('end', () => resolve(body.join('')));
    });
    request.on('error', (err) => reject(err));
  });
};
 
const skillBuilder = Alexa.SkillBuilders.custom();
 
exports.handler = skillBuilder
  //.withPersistenceAdapter(getPersistenceAdapter('Intent-Fitness'))
  .addRequestHandlers(
    LaunchRequestHandler,
    FallBackHandler,
    FitnessJourneyIntent,
    QuizIntent,
    AnswerIntent,
    RepeatHandler,
    HelpIntentHandler,
    CancelAndStopIntentHandler,
    SessionEndedRequestHandler,
    WorkoutIntent,
    ChangeCategoryIntent
  )
  .addErrorHandlers(ErrorHandler)
  .lambda();