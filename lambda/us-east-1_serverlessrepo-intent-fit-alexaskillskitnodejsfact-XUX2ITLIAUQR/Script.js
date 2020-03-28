const { CountryRelated } = require('./Audio_URLS.js');
const { FestivalRelated } = require('./Audio_URLS.js');

module.exports = {
    'france':[
        {
            'dialog': `Let's go to France with Simba!!`
                + `<audio src="${CountryRelated.france.CLIP1}"/> ` ,
            'response': `bonjour`,
 
        },
        {
            'wrongRes': `let us see what `,
            'correctRes': `i think so too, let us see what `,
            'dialog': `simba and friends say <audio src="${CountryRelated.france.CLIP2}"/> `
                + `simba and friends reached a restraunt`
                + ` <audio src="${CountryRelated.france.CLIP3}"/> and then they start to climb the eiffel tower `
                 + ` <audio src="${CountryRelated.france.CLIP4}"/> simba and friends now came across the big building.`
                 + ` do you know what that big building is called?`,
            'response': `notre dame`,
        },
        {
            'wrongRes': `lets see what simba says`,
            'correctRes': `lets see what simba says`,
            'dialog': ` <audio src="${CountryRelated.france.CLIP5}"/> `
            + `That's where our trip to France ends. Hope you enjoyed it!`,
            'end': true,
        }
        ],
    'india':[
        {
            'dialog': `Let's go to India with Simba and Friends.` + `<audio src="${CountryRelated.india.CLIP0}"/>`
            + `<audio src="${CountryRelated.india.CLIP1}"/>` + `Have you heard of Durgashtami before?`,
            'response' : `yes`,
        },
        {
            'correctRes' : `That's nice, Let’s see what Durgashtami is about?` + `<audio src="${CountryRelated.india.CLIP2}"/>`, 
            'wrongRes' : `No worry, Let’s see what Durgashtami is about?` + `<audio src="${CountryRelated.india.CLIP2}"/>`,
            'dialog' : `<audio src="${CountryRelated.india.CLIP3}"/>` + `Don't we all love mountains? Let's see how it is in Kanchenjunga.`
             + ` won't it be great to be at the top of the world? But is Kanchenjunga the top of the world? Let's find out.` + `<audio src="${CountryRelated.india.CLIP4}"/>`
             + `<audio src="${CountryRelated.india.CLIP5}"/>` + `Did you know Taj Mahal is one of the seven wonders of the world?`,
            'response' : `yes`,
        },
        {
            'correctRes' : `That's amazing, let's find out more about taj mahal.` + `<audio src="${CountryRelated.india.CLIP6}"/>`,
            'wrongRes' : `okay! Excited to learn more about taj mahal, aren't we ?` + `<audio src="${CountryRelated.india.CLIP6}"/>`,
            'dialog' : `Oh nice! Do you know the name of any church?`,
            'response': `yes`,
        },
        {
            'correctRes' : `Oh Interesting! Let's learn more about the culture of India.`,
            'wrongRes' : `Okay! Let's explore more about the culture of India.`,
            'dialog' : `<audio src="${CountryRelated.india.CLIP7}"/>` + `Now we know why India is known as the Land of Culture.` + `<audio src="${CountryRelated.india.CLIP8}"/>`
            + `Do you know what is national animal of India?`,
            'response' : `tiger`
        },
        {
            'correctRes' : `That's right.` + `<audio src="${CountryRelated.india.CLIP9}"/>`,
            'wrongRes' : `<audio src="${CountryRelated.india.CLIP9}"/>`,
            'dialog' : `Do you know what is national bird of India?`,
            'response' : `peacock`,
        },
        {
            'correctRes' : `That's right.` + `<audio src="${CountryRelated.india.CLIP10}"/>`,
            'wrongRes' : `<audio src="${CountryRelated.india.CLIP10}"/>`,
            'dialog' : `Now we learned what is the national bird and animal of India.`
            + `That's where our trip to India ends. Hope you enjoyed it!`,
            'end' : true,
        },
    ],
    'australia':[
        {
            'dialog': `<audio src="${CountryRelated.australia.CLIP1}"/>` + `Let's go to Australia with 
            Simba and Friends!` + `<audio src="${CountryRelated.australia.CLIP2}"/>` + `Woohoo we reached 
            Australia! Did you have barbeque before? Do you want to try it out today?`,
            'response': `yes`,
        },
        {
            'correctRes': `let's have some ` + `<audio src="${CountryRelated.australia.CLIP3}"/>`,
            'wrongRes': `No problem! Let's find out ` + `<audio src="${CountryRelated.australia.CLIP3}"/>`,
            'dialog': `Have you ever heard about the Sydney Opera House?`,
            'response': `yes`,
        },
        {
            'correctRes': `Let's find out` + `<audio src="${CountryRelated.australia.CLIP4}"/>`,
            'wrongRes': `Let's find out` + `<audio src="${CountryRelated.australia.CLIP4}"/>`,
            'dialog': `Did you know that duck-billed platypus is endangered.
            There are very few left in this world. 	Let's see some more animals 
            with Simba. shall we? ` + `<audio src="${CountryRelated.australia.CLIP5}"/>` + ` Woahh !!! I 
            didn't know Australia had so many weird animals. Let's see what more
            is in store for us. I don't know what down under they are talking 
            about, do you? Let's see if Simba finds out.` + `<audio src="${CountryRelated.australia.CLIP6}"/>` 
            + `Have you heard that sound before? It's kind of weird and spooky.`,
            'response': `yes`,
        },
        {
            'correctRes': `Let's find out` + `<audio src="${CountryRelated.australia.CLIP7}"/>`,
            'wrongRes': `Let's find out ` + `<audio src="${CountryRelated.australia.CLIP7}"/>`,
            'dialog': `Did you know the Great Coral Reef is the world’s largest
            coral reef. It would be so much fun to visit there with Simba? ` + 
            `<audio src="${CountryRelated.australia.CLIP8}"/> ` + `So, finally Simba found out what is down 
            under. Let's see the reef now.` + `<audio src="${CountryRelated.australia.CLIP9}"/>`
            + `That's where our trip to Australia ends. Hope you enjoyed it!`,
            'end': true,
        },
    ],
    'diwali':[
        {
            'dialog': `All set to learn about Diwali! Let's go... ` 
            + ` Neena came to her animal friends wearing a beautiful Indian dress and with some sweets.` 
            + `<audio src="${FestivalRelated.diwali.CLIP1}"/>` + `Neena is super excited to talk about Diwali.`
            + ` <amazon:effect name="whispered">Pay attention!</amazon:effect>`
            + ` <audio src="${FestivalRelated.diwali.CLIP2}"/>` 
            + ` Before Neena tells it, Do you know what the colorful patterns on the floor called?`,
            'response': `rangoli`,
        },
        {
            'correctRes': `Correct! Let's get back to Neena.`,
            'wrongRes': `That's not correct. Let's hear it from Neena.`,
            'dialog': `<audio src="${FestivalRelated.diwali.CLIP3}"/>`
            + ` A very important lesson came long while learning about Diwali.`
            + ` <audio src="${FestivalRelated.diwali.CLIP4}"/>`
            + ` That was all about Diwali. Hope you enjoyed it!`,
            'end': true,
        },
    ],
    'christmas':[
        {
            'dialog':  `All set to learn about Christas! Let's go... `
            + ` Neena brought a snow globe to show her animal friends.` 
            + `<audio src="${FestivalRelated.christmas.CLIP1}"/>` + ` Neena is super excited to talk about Christmas.`
            + ` <amazon:effect name="whispered">Pay attention!</amazon:effect>`
            + ` <audio src="${FestivalRelated.christmas.CLIP2}"/>` 
            + ` That was all about why Christmas is celebrated. Would you like to celebrate Christmas with Neena?`,
            'response': `yes`,
        },
        {
            'correctRes': `Great! Let's celebrate.`,
            'wrongRes': `Sad. Looks like Neena will celebrate only with her friends.`,
            'dialog': `<audio src="${FestivalRelated.christmas.CLIP3}"/>`
            + ` Would you like to sing the Christmas song?`,
            'response': `yes`,
        },
        {
            'correctRes': `Great! Sing along.` + `<audio src="${FestivalRelated.christmas.CLIP4}"/>`,
            'wrongRes': `That's fine.`,
            'dialog': ` That was all about Christmas. Hope you enjoyed it!`,
            'end': true,
        },
    ],
    'eid':[
        {
            'dialog':  `All set to learn about eid! Let's go... ` 
            + ` Neena got her animal friends different types of dishes.` 
            + ` <audio src="${FestivalRelated.eid.CLIP1}"/>`
            + ` Before Neena tells it, Do you know what the month before Eid Ul Fitr called?`,
            'response': `ramadan`,
        },
        {
            'correctRes': `Correct! Let's get back to Neena.`,
            'wrongRes': `That's not correct. Let's hear it from Neena.`,
            'dialog':`<audio src="${FestivalRelated.eid.CLIP2}"/>`
            + ` That was all about Eid Ul Fitr. Let’s say Eid Mubarak with Neena.`
            + ` <audio src>="${FestivalRelated.eid.CLIP3}"`
            + ` That was all about Eid Ul Fitr. Hope you enjoyed it!`,
            'end': true,            
        },
    ],
};