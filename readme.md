# Mark-Js
Mark-Js is a Markov Bot which is a form of chatbot which takes text and outputs text which is different, but seemingly related. This has two function, namely `map` & `create`, where the first generates a Markov "map" from a piece of text, and the second uses that the given "map" to create new text. I also have a [Python version of this](https://github.com/ollybritton/Mark-Py), named `Mark-Py`, which is similar but is designed to generate larger amounts of text for more esoteric purposes.

## Use

As I briefly mentioned above, the script contains two functions actually related to text parsing and creation (these are also described in the code itself).

+ `map(messages)`, given an array of messages, it will return an array which has an array of all starting words as the first element, and then an array of "chain-pairs", which consist of two starting words, and then all the words that follow them. For more info about what I mean by this, have a look at the "How" section.

+ `create(map)`, given a map from the function above, this will return a new message which is built from the previous messages.

## Example Uses
### Discord Bot
In this example, I show how this library could be used to make simple discord bot which responds to a user.

<script src="https://gist.github.com/ollybritton/89801595a81afe2a798624426971c449.js"></script>

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
