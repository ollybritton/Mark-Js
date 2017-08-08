// jshint esversion: 6

const settings = {
    chain_length: 2, // Length of sequences of words
    max_words: 30, // Maximum amount of words in a formed "sentence"
    stop_char: "\x02", // Character that indicates the stop of a string
    seperator: "\x01" // Character to get around problem with array comparison
};

let last_elem = function(xs) {
    /*
    last_elem(xs):
    Returns the last element in an array.
    */
    return xs[xs.length - 1];
};

function random_int(min, max) {
    /*
    random_int(min, max):
    Given a maximum and a minimum, returns a random interger within that range.
    */
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

let random_elem = function(arr) {
    /*
    random_elem(arr):
    Takes an array and returns a random element from it.
    */
    return arr[random_int(0, arr.length - 1)];
};

let split_text = function(messages) {
    /*
    split_text(messages):
    Takes an array of messages returns an array with all the starting words as the first
    element and then a array of chains as the second.

    Chains have the following structure:
    [ [word1, word2, ...*chain_length times*..], [follow1, follow2...] ],
    where "follow" indicates a word that follows the text.

    For example,
    ["this is a test", "this is also a test"] => [[["this","is"],["a","also"]],[["is","a"],["test"]],[["a","test"],["<stop>","<stop>"]],[["is","also"],["a"]],[["also","a"],["test"]]]

    Repeats in the "followings" are allowed, as it makes them more common when
    randomly chosen.

    */

    starting = [];
    splits = [];

    for (let i = 0; i < messages.length; i++) {

        let message = messages[i] + " " + settings.stop_char;
        let chains = [];
        message = message.split(" ");

        if (starting.indexOf(message[0]) == -1) {
            starting.push(message[0]);
        }

        for (let j = 0; j < (message.length - settings.chain_length); j++) {

            chains.push(message.slice(j, j + settings.chain_length + 1));

        }

        for (let j = 0; j < chains.length; j++) {

            let chain = chains[j];
            let head = chain.slice(0, settings.chain_length);
            let tail = chain.slice(settings.chain_length);

            let repeat = false;

            for (let i1 = 0; i1 < splits.length; i1++) {

                let curr_head = splits[i1][0];
                let curr_tail = splits[i1][1];

                if (head.join(settings.separator) == curr_head.join(settings.separator)) {
                    splits[i1][1].push(tail[0]);
                    repeat = true;
                }

            }

            if (!repeat) {

                splits.push([head, tail]);

            }


        }

    }

    return [starting, splits];

};


let create_message = function(splits) {
    /*
    create_message(splits):
    Takes a series of splits (the result of the split_text function) and returns
    a new message, built from those splits.
    */

    let starting = random_elem(splits[0]);
    let curr = [starting];
    splits = splits[1];


    for (let i = 0; i < settings.max_words; i++) {

        previous = last_elem(curr);
        possible = [];

        if (previous == settings.stop_char) {
            break;
        }

        for (let j = 0; j < splits.length; j++) {

            let chain = splits[j];
            if (chain[0][0] == previous) {

                possible.push(chain);

            }

        }

        if (possible.length === 0) {
            break;
        }

        possible = random_elem(possible);
        curr.push(possible[0][1]);
        curr.push(random_elem(possible[1]));


    }

    return curr.join(" ");

};

module.exports = {
    map: function(messages) {
        return split_text(messages);
    },

    create: function(map) {
        return create_message(map);
    }
};
