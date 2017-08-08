# Mark-Js
Mark-Js is a Markov Bot which is a form of chatbot which takes text and outputs text which is different, but seemingly related. This has two function, namely `map` & `create`, where the first generates a Markov "map" from a piece of text, and the second uses that the given "map" to create new text. I also have a [Python version of this](github.com/ollybritton/Mark-Py), named `Mark-Py`, which is similar but is designed to generate larger amounts of text for more esoteric purposes.

## Use

As I briefly mentioned above, the script contains two functions actually related to text parsing and creation (these are also described in the code itself).

+ `map(messages)`, given an array of messages, it will return an array which has an array of all starting words as the first element, and then an array of "chain-pairs", which consist of two starting words, and then all the words that follow them. For more info about what I mean by this, have a look at the "How" section.

+ `create(map)`, given a map from the function above, this will return a new message which is built from the previous messages.

## Example Uses
### Discord Bot
In this example, I show how this library could be used to make simple discord bot which responds to a user.

    // jshint esversion: 6
    const Discord = require("discord.js");
    const mark = require("./mark");

    const client = new Discord.Client();

    let chattiness = 0.5;
    // Initialise a chattiness, which is a measure of how often it speaks by itself.

    client.on("ready", () => {
    console.log(`\n=== THE BOT IS ALIVE ===`);
    // Alert when the bot is ready
    });

    let command_parse = function(content, command_start) {
      // Create a function which parses a message into a command
      let splitted = content.split(" ");
      // Split the message into individual words

      if(splitted[0] !== command_start) {

          return false; // If the command doesn't start properly, return false.

      } else {

          return splitted.slice(1); // Return everything except the initial command

      }
    };

    client.on(`message`, message => {
      console.log(`Message encountered.`);
      // Alert that the bot has received a message.

      if (message.author.id === <YOUR BOT USER ID>) {
          return; // Check if the message came from the bot itself, and if so, stop anything else from running.
      }

      let history = [];

      message.channel.fetchMessages({
          limit: 100
      })
      .then(messages => {
          messages.forEach( (item, key, map) => {

              history.push(item.toString());
              // Fetch 100 (the limit) messages and push them to an array called history

          });

          let command = command_parse(message.content, "/bot");
          // Parse the message using the command_parse we defined earlier, also make sure it starts with "/bot".

          if (command[0] === "reply") {

              message.channel.send( mark.create( mark.splits(history) ) );
              return;
              // Check if the user wrote "/bot reply" and if so, create and send a message "trained" from the last 100 messages.

          }

          if (command[0] === "chattiness") {

              chattiness = command[1];
              return;
              // Check if the command is "/bot chattiness <x>" and set the chattiness to be the value afterwards.

          }


          let random = Math.random();
          // Create a random number between 0 and 1.
          if (random < chattiness) {
              // If the random number is less than the chattiness (the amount this happens depends on chattiness, low values trigger less and higher values more),

              message.channel.send( mark.create( mark.splits(history) ) );
              return;
              // If so, then create a message "trained" from the last 100 messages.


          }
      })
      .catch(console.error);

    });

    client.login('yeah...no im not giving you the key');
    // You need to replace this with your login token


## How
Markov bots are made by creating Markov "chains" which represent the probability that one specific word follows another. For example, lets say we have the phrase: `"this is a test"` and `"this is also a test"`.

First, we split the text into sections which consist of a "head" and a "tail", and what each phrase starts with:

    (this, is) -> (a)
    (is, a) -> (test)
    (a, test) -> (this)
    (test, this) -> (is)
    (this, is) -> (also)
    (is, also) -> (a)
    (also, a) -> (test)

    starting = (this, this)

Then, we "add" together and duplicate chains. In our case, we have a repeated `(this, is)`:

    (this, is) -> (a, also)
    (is, a) -> (test)
    (a, test) -> (this)
    (test, this) -> (is)
    (is, also) -> (a)
    (also, a) -> (test)

So now we know that when a sentence starts with `this is`, we need to follow it with either an `also` or `a`.

To generate a new phrase, we simply choose a word from the `starting` words, and then search for "heads" that also begin with that.

    starting_choice = this
    search = (this, is)

Now we have a starting "head", we chose from the available words in the "tail":

    head = (this, is)
    tail = (a, also)

    random_choice = a

Now we repeat the above step, but starting with `a`. This yields:

    current = "this is a "
    head = (a, test)

Now we have `this is a test`. Of course, this is already a phrase as the amount of original text is so small, but now imagine doing the same process for a much larger file, building up an entire dictionary of phrases and things that follow them and you'll be able to generate lots of new phrases.
