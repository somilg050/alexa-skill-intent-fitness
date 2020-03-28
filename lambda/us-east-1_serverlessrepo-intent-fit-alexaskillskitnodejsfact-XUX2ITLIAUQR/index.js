/* eslint-disable  func-names */
/* eslint-disable  no-console */

const Alexa = require('ask-sdk-core');
const ddbAdapter = require('ask-sdk-dynamodb-persistence-adapter');
const Script = require('./Script.js');
const { OtherAudio, CountryRelated } = require('./Audio_URLS.js');

var RandomInt = (min, max) => {
		return Math.floor(Math.random()*(max-min+1)+min);
	};
	
  const LaunchRequestHandler = {
    canHandle(handlerInput) {
      return handlerInput.requestEnvelope.request.type === 'LaunchRequest';
    },
    handle(handlerInput) {
      const speechText = `Welcome to IntentFitness, the fun way to train both your mind and your body. 
      You can ask for an interesting fitness fact or start your fitness journey. What would you like to do?`;
  
      return handlerInput.responseBuilder
        .speak(speechText)
        .withShouldEndSession(false)
        .getResponse();
    },
  };
  
  const FitnessJourneyIntent = {
    canHandle(handlerInput) {
      var SessionAttributes = handlerInput.attributesManager.getSessionAttributes();
      return handlerInput.requestEnvelope.request.type === 'IntentRequest'
        && handlerInput.requestEnvelope.request.intent.name === 'FitnessJourneyIntent';
    },
    async handle(handlerInput) {
      var speechText = "Let's get you started on your fitness journey!"
      return handlerInput.responseBuilder
        .speak(speechText)
        .withShouldEndSession(false)
        .getResponse();
    },
  };

const ExploreWorldIntent = {
  canHandle(handlerInput) {
    var SessionAttributes = handlerInput.attributesManager.getSessionAttributes();
    var cond = false;
    if(SessionAttributes.hasOwnProperty("unfinishedJourney")){
      cond = true;
    }
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && (handlerInput.requestEnvelope.request.intent.name === 'ExploreWorldIntent' 
        || cond);
  },
  async handle(handlerInput) {
    var Keys = Object.keys(Script);
    var request = handlerInput.requestEnvelope.request;
    var SessionAttributes = handlerInput.attributesManager.getSessionAttributes();
    var RandomCountry = Keys[RandomInt(0, 2)];
    var speechText = "";

    if(!SessionAttributes.hasOwnProperty("unfinishedJourney")){
      var PersistenceAttributes = await handlerInput.attributesManager.getPersistentAttributes();
      if(PersistenceAttributes.hasOwnProperty("State")){
        SessionAttributes = handlerInput.attributesManager.getSessionAttributes();
        SessionAttributes.unfinishedJourney = true;
        handlerInput.attributesManager.setSessionAttributes(SessionAttributes);
        speechText = `Oh, it looks like you were in middle of a `
        +`journey in ${PersistenceAttributes.Exploring}, would you like to countinue traveling?`;
        
        return handlerInput.responseBuilder
          .speak(speechText)
          .withShouldEndSession(false)
          .getResponse();
      }
    }else{
      delete SessionAttributes.unfinishedJourney;
      if(request.intent.name === 'AMAZON.YesIntent'){
        SessionAttributes = await handlerInput.attributesManager.getPersistentAttributes();
        handlerInput.attributesManager.setSessionAttributes(SessionAttributes);
        return ExploringAChapter.handle(handlerInput);
      }else if(request.intent.name === 'AMAZON.NoIntent'){
        handlerInput.attributesManager.setPersistentAttributes({});
        await handlerInput.attributesManager.savePersistentAttributes();
      }
    }

    speechText = `Get ready to explore `
      + `countries with simba and his friends. `
      + ` <audio src="${CountryRelated.countryIntro}"/> `
      + `Lets spin the magic wheel to see where simba and his friends are going today? ` 
      + ` <audio src="${OtherAudio.magic_wheel}"/>`;

    if(request.intent.hasOwnProperty("slots") 
        &&  request.intent.slots.hasOwnProperty("country")
        && request.intent.slots.country.hasOwnProperty('value')){
      
      var givenCountry = request.intent.slots.country.value;
      givenCountry = givenCountry.toLowerCase();
      var index = Keys.findIndex((ele) => ele === givenCountry);
      console.log(givenCountry);
      if(index == -1){
        speechText = `Oh no, Simba can't go to ${givenCountry}, but simba knows ${RandomCountry} is amazing.`
        + ` Would you like to explore ${RandomCountry} with Simba?`;
      }else{
        SessionAttributes.Exploring = givenCountry;
        SessionAttributes.Scene = 0; 
        SessionAttributes.State = 'ExploringCountry';
        handlerInput.attributesManager.setSessionAttributes(SessionAttributes);
        return ExploringAChapter.handle(handlerInput);
      }
    }else{
      speechText += ` we got ${RandomCountry}, `
      + `Would you like to explore ${RandomCountry} `;
    }

    SessionAttributes.SuggestedCountry = RandomCountry;
    SessionAttributes.State = "SuggestedCountry";
    SessionAttributes.SuggestedCountryCount = 1;
    handlerInput.attributesManager.setSessionAttributes(SessionAttributes);
    SessionAttributes.last = speechText;
    
    return handlerInput.responseBuilder
      .speak(speechText)
      .withShouldEndSession(false)
      .getResponse();
  },
};

const ExploringAChapter = {
  canHandle(handlerInput) {
    var request = handlerInput.requestEnvelope.request;
    var SessionAttributes = handlerInput.attributesManager.getSessionAttributes();
    
    return request.type === 'IntentRequest' && !(request.intent.name === 'ExploreWorldIntent')
      && (SessionAttributes.State === 'SuggestedCountry' 
      || SessionAttributes.State === 'ExploringCountry');
  },
  async handle(handlerInput) {
    var speechText = '';
    var request = handlerInput.requestEnvelope.request;
    var SessionAttributes = handlerInput.attributesManager.getSessionAttributes();
    var Country = SessionAttributes.SuggestedCountry;
    var Festival = SessionAttributes.SuggestedFestival;
    var endSession =false;
    if(request.intent.name === 'AMAZON.StopIntent' || request.intent.name === 'AMAZON.CancelIntent'){
      return CancelAndStopIntentHandler.handle(handlerInput);
    }
    if(SessionAttributes.State === 'SuggestedCountry'){
      if(request.intent.name === 'AMAZON.StopIntent' || request.intent.name === 'AMAZON.CancelIntent'){
        return CancelAndStopIntentHandler.handle(handlerInput);
      }
      if(request.intent.name === 'AMAZON.NoIntent'){
        var Keys = Object.keys(Script);
        var index = Keys.findIndex((ele) => ele === Country);
        
        Country = Keys[(index+1)%3];
        speechText = ` ok then let's spin the wheel again <audio src="${OtherAudio.magic_wheel}"/>`
          +` looks like the wheel decided to take us to ${Country}. Would you like to explore ${Country}`;
        SessionAttributes.SuggestedCountry = Country;
        SessionAttributes.SuggestedCountryCount += 1;
        
        if(SessionAttributes.SuggestedCountryCount >= 4){
          speechText = `Looks like I can't please you, so I give up. Simba says bye.`;
          endSession=true;
        }
        
        return handlerInput.responseBuilder
        .speak(speechText)
        .withShouldEndSession(endSession)
        .getResponse();

      }else if(request.intent.name === 'AMAZON.YesIntent'){
        SessionAttributes = {};
        SessionAttributes.Exploring = Country;
        SessionAttributes.Scene = 0; 
        SessionAttributes.State = 'ExploringCountry';
        handlerInput.attributesManager.setSessionAttributes(SessionAttributes);
      }
    }

    Country = SessionAttributes.Exploring;
    var Scene = SessionAttributes.Scene;
    var resp;
    
    if(SessionAttributes.State === 'ExploringCountry'){
      if(Scene != 0){
        if(request.intent.name === 'AMAZON.StopIntent' || request.intent.name === 'AMAZON.CancelIntent'){
          return CancelAndStopIntentHandler.handle(handlerInput);
        }
        SessionAttributes.last = speechText;
        console.log("af "+speechText);
        if(request.intent.hasOwnProperty("slots")
          && request.intent.slots.hasOwnProperty("Answer") 
          && request.intent.slots.Answer.hasOwnProperty("resolutions")){
          console.log('1');
          resp = request.intent.slots.Answer.resolutions;
          resp = resp.resolutionsPerAuthority[0].values[0].value.name;
          if(resp === Script[Country][Scene-1].response){
            console.log('2');
            speechText = Script[Country][Scene].correctRes;
          }
        }else if(Script[Country][Scene-1].response === 'yes' 
          && request.intent.name === 'AMAZON.YesIntent'){
            console.log('3');
          speechText = Script[Country][Scene].correctRes;
        }else if(request.intent.hasOwnProperty("slots")
          &&  request.intent.slots.hasOwnProperty("animal")
          && request.intent.slots.animal.hasOwnProperty("value") 
          && request.intent.slots.animal.value === Script[Country][Scene-1].response){
          speechText = Script[Country][Scene].correctRes;
          console.log('4');
        }
        else{
          speechText = Script[Country][Scene].wrongRes;
        }
        var PersistenceAttributes = {
          State: SessionAttributes.State,
          Scene: SessionAttributes.Scene,
          Exploring: SessionAttributes.Exploring,
        };
        handlerInput.attributesManager.setPersistentAttributes(PersistenceAttributes);
        await handlerInput.attributesManager.savePersistentAttributes();
      }
      console.log(speechText);
      speechText += Script[Country][Scene].dialog;
      SessionAttributes.Scene += 1;
      if(Script[Country][Scene].end){
        speechText += ` You can explore another country or learn about another festival. What would you like to do next? `;
        handlerInput.attributesManager.setSessionAttributes({});
        handlerInput.attributesManager.setPersistentAttributes({});
        await handlerInput.attributesManager.savePersistentAttributes();
        endSession = false;
      }
    }
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

const skillBuilder = Alexa.SkillBuilders.custom();

exports.handler = skillBuilder
  .withPersistenceAdapter(getPersistenceAdapter('Intent-Fitness'))
  .addRequestHandlers(
    LaunchRequestHandler,
    FallBackHandler,
    ExploreWorldIntent,
    ExploreFestivalIntent,
    ExploringAChapter,
    RepeatHandler,
    HelpIntentHandler,
    CancelAndStopIntentHandler,
    SessionEndedRequestHandler,
  )
  .addErrorHandlers(ErrorHandler)
  .lambda();