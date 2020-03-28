/* eslint-disable  func-names */
/* eslint-disable  no-console */

const Alexa = require('ask-sdk-core');
const ddbAdapter = require('ask-sdk-dynamodb-persistence-adapter');

var RandomInt = (min, max) => {
  return Math.floor(Math.random()*(max-min+1)+min);
};

var i;
	
const LaunchRequestHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'LaunchRequest';
  },
  handle(handlerInput) {
    const speechText = `Welcome to Intent Fitness, the fun way to train both your mind and your body. 
    You can ask for an interesting fitness fact or start your fitness journey. What would you like to do?`;

    return handlerInput.responseBuilder
      .speak(speechText)
      .withShouldEndSession(false)
      .getResponse();
  },
};

var decodeHTML = function (html) {
  var txt = document.createElement('textarea');
  txt.innerHTML = html;
  return txt.value;
};
  
const FitnessJourneyIntent = {
  canHandle(handlerInput) {
    var SessionAttributes = handlerInput.attributesManager.getSessionAttributes();
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'FitnessJourneyIntent';
  },
  async handle(handlerInput) {
    var SessionAttributes = handlerInput.attributesManager.getSessionAttributes();
    var speechText = "Let's get you started on your fitness journey!";
    
    return handlerInput.responseBuilder
      .speak(speechText)
      .withShouldEndSession(false)
      .getResponse();
  },
};

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

    var endSession =false;
    if(request.intent.name === 'AMAZON.StopIntent' || request.intent.name === 'AMAZON.CancelIntent'){
      return CancelAndStopIntentHandler.handle(handlerInput);
    }

    var URL = `https://opentdb.com/api.php?amount=5&difficulty=easy&type=multiple`;
    const request = handlerInput.requestEnvelope.request;

    if(handlerInput.requestEnvelope
      && handlerInput.requestEnvelope.request
      && handlerInput.requestEnvelope.request.intent
      && handlerInput.requestEnvelope.request.intent.slots
      && handlerInput.requestEnvelope.request.intent.slots.category
      && handlerInput.requestEnvelope.request.intent.slots.category.resolutions
      && handlerInput.requestEnvelope.request.intent.slots.category.resolutions.resolutionsPerAuthority[0]
      && (handlerInput.requestEnvelope.request.intent.slots.category.resolutions.resolutionsPerAuthority[0].status.code === "ER_SUCCESS_MATCH")){
        category = request.intent.slots.category.resolutions.resolutionsPerAuthority[0].values[0].value.name;
    }

    if(handlerInput.requestEnvelope.request.intent.slots.category.value){
      let categorySlot = handlerInput.requestEnvelope.request.intent.slots['category'].value;
      let categoryId = handlerInput.requestEnvelope.request.intent.slots.category.resolutions.resolutionsPerAuthority[0].values[0].value.id;
      if(categoryId != 0){
        speechText = `Here are your questions in ${categorySlot} category!!`;
        URL+=`&category=${categoryId}`;
      }
      else{
        speechText = `Here we go!!`;
      }
    }
    var ques, ans;
    await getRemoteData(URL)
    .then((response) => {
      const data = JSON.parse(response);
      if(SessionAttributes.count){
        i = SessionAttributes.count; 
      }
      else{
        i = 0;
      }
      ques = data.results[i].question;
      ans = data.results[i].correct_answer;
      SessionAttributes.data = data;
      i++;
      SessionAttributes.count = i;
    })
    .catch((err) => {
      //set an optional error message here
      speechText = err.message;
    });

    var decoded = decodeHTML(ques);
    speechText += decoded;

    SessionAttributes.last = speechText;
    return handlerInput.responseBuilder
      .speak(speechText)
      .withShouldEndSession(endSession)
      .getResponse();
  },
};

const CancelAndStopIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && (handlerInput.requestEnvelope.request.intent.name === 'AMAZON.CancelIntent'
        || handlerInput.requestEnvelope.request.intent.name === 'AMAZON.StopIntent');
  },
  handle(handlerInput) {
    const speechText = `Simba says Goodbye! come back later`;

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
    var speechText ="Simba quite can't understand what you just said. ";
    var SessionAttributes = handlerInput.attributesManager.getSessionAttributes();
    
    if(SessionAttributes.State === 'SuggestedCountry'){
      speechText = `Simba had difficulty understanding by what you said, `
      + ` do you want to go to ${SessionAttributes.SuggestedCountry} `
      + `or try something else. try answering with yes or no `;
    }
    else if(SessionAttributes.State === 'ExploringCountry'){
      speechText += SessionAttributes.last; 
    }
    SessionAttributes.last = speechText;
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
    const speechText = `Hello Friends! Welcome abord! You can explore a country with simba
    or learn about a festival. What would you like to do?`;
    const SessionAttributes = handlerInput.attributesManager.getSessionAttributes();
    SessionAttributes.last = speechText;
    
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
    var speechOutput = SessionAttributes.last;
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
    .speak(`Simba doesn't feel so good, come back later.`)
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
      .speak(`Simba dosn't feel so good, talk to you later.`)
      .withShouldEndSession(true)
      .getResponse();
  },
};

function getPersistenceAdapter(tableName) {
  // Not in Alexa Hosted Environment
  return new ddbAdapter.DynamoDbPersistenceAdapter({
    tableName: tableName,
    createTable: true
  });
}

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
    request.on('error', (err) => reject(err))
  })
};

const skillBuilder = Alexa.SkillBuilders.custom();

exports.handler = skillBuilder
  .withPersistenceAdapter(getPersistenceAdapter('Intent-Fitness'))
  .addRequestHandlers(
    LaunchRequestHandler,
    FallBackHandler,
    FitnessJourneyIntent,
    QuizIntent,
    RepeatHandler,
    HelpIntentHandler,
    CancelAndStopIntentHandler,
    SessionEndedRequestHandler,
  )
  .addErrorHandlers(ErrorHandler)
  .lambda();