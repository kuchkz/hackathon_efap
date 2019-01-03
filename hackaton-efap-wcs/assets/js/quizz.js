import '../scss/quizz.scss';

// Array of all the questions and choices to populate the questions. This might be saved in some JSON file or a database and we would have to read the data in.
let all_questions = [{
    question_string: "Combien d'applications sont \"actives\" dans notre smartphone sans qu'on ne les utilise pas réellement ?",
    choices: {
        correct: "35",
        wrong: ["28", "17", "5"]
    }
}, {
    question_string: "Si Internet était un pays, que représenterait sa consommation d'énergie au niveau mondial ?",
    choices: {
        correct: "3e place",
        wrong: ["1re place", "6e place", "10e place"]
    }
}, {
    question_string: "Combien de Français ont accès à Internet en France ?",
    choices: {
        correct: "88%",
        wrong: ["56%", "67%", "100%"]
    }
}, {
    question_string: "Combien de temps passent les Français sur Internet chaque jour ?",
    choices: {
        correct: "4h48",
        wrong: ["1h37", "6h32", "8h45"]
    }
}, {
    question_string: "Combien de temps passent les Français sur les réseaux sociaux chaque jour ?",
    choices: {
        correct: "1h22",
        wrong: ["2h43", "8h55", "12h54"]
    }
}, {
    question_string: "Quel est le navigateur le plus utilisé dans le monde ?",
    choices: {
        correct: "Chrome",
        wrong: ["Safari", "Firefox", "Bing"]
    }
}, {
    question_string: "Quel est le site le plus visité dans le monde ?",
    choices: {
        correct: "YouTube",
        wrong: ["Amazon", "Facebook", "Deezer"]
    }
}, {
    question_string: "Combien d'e-mails sont envoyés chaque heure dans le monde ?",
    choices: {
        correct: "10 milliards",
        wrong: ["10 000", "10 millions", "100 millions"]
    }
}];

// An object for a Quiz, which will contain Question objects.
let Quiz = function(quiz_name) {
    // Private fields for an instance of a Quiz object.
    this.quiz_name = quiz_name;

    // This one will contain an array of Question objects in the order that the questions will be presented.
    this.questions = [];
}

// A function that you can enact on an instance of a quiz object. This function is called add_question() and takes in a Question object which it will add to the questions field.
Quiz.prototype.add_question = function(question) {
    // Randomly choose where to add question
    let index_to_add_question = Math.floor(Math.random() * this.questions.length);
    this.questions.splice(index_to_add_question, 0, question);
}

// A function that you can enact on an instance of a quiz object. This function is called render() and takes in a letiable called the container, which is the <div> that I will render the quiz in.
Quiz.prototype.render = function(container) {
    // For when we're out of scope
    let self = this;

    // Hide the quiz results modal
    $('#quiz-results').hide();

    // Write the name of the quiz
    $('#quiz-name').text(this.quiz_name);

    // Create a container for questions
    let question_container = $('<div class="jumbotron shadow p-3 mb-5 bg-white rounded">').attr('id', 'question').insertAfter('#quiz-name');

    // Helper function for changing the question and updating the buttons
    function change_question() {
        self.questions[current_question_index].render(question_container);
        $('#prev-question-button').prop('disabled', current_question_index === 0);
        $('#next-question-button').prop('disabled', current_question_index === self.questions.length - 1);

        // Determine if all questions have been answered
        let all_questions_answered = true;
        for (let i = 0; i < self.questions.length; i++) {
            if (self.questions[i].user_choice_index === null) {
                all_questions_answered = false;
                break;
            }
        }
        $('#submit-button').prop('disabled', !all_questions_answered);
    }

    // Render the first question
    let current_question_index = 0;
    change_question();

    // Add listener for the previous question button
    $('#prev-question-button').click(function() {
        if (current_question_index > 0) {
            current_question_index--;
            change_question();
        }
    });

    // Add listener for the next question button
    $('#next-question-button').click(function() {
        if (current_question_index < self.questions.length - 1) {
            current_question_index++;
            change_question();
        }
    });

    // Add listener for the submit answers button
    $('#submit-button').click(function() {
        // Determine how many questions the user got right
        let score = 0;
        for (let i = 0; i < self.questions.length; i++) {
            if (self.questions[i].user_choice_index === self.questions[i].correct_choice_index) {
                score++;
            }
        }

        // Display the score with the appropriate message
        let percentage = score / self.questions.length;
        $.ajax({
            url: "result/" + percentage,
            success: function (data) {
            }
        });
        console.log(percentage);
        let message;
        if (percentage === 1) {
            message = 'WOW super!'
        } else if (percentage >= .75) {
            message = 'Beau score'
        } else if (percentage >= .5) {
            message = 'C\'est bien mais tu peux faire mieux.'
        } else {
            message = 'Essaie peut-être au hasard.'
        }
        $('#quiz-results-message').text(message);
        $('#quiz-results-score').html('Tu as obtenu <b>' + score + '/' + self.questions.length + '</b>' +
            ' <questions></questions> correctes.');
        $('#quiz-results').slideDown();
        $('#quiz button').slideUp();
    });

    // Add a listener on the questions container to listen for user select changes. This is for determining whether we can submit answers or not.
    question_container.bind('user-select-change', function() {
        let all_questions_answered = true;
        for (let i = 0; i < self.questions.length; i++) {
            if (self.questions[i].user_choice_index === null) {
                all_questions_answered = false;
                break;
            }
        }
        $('#submit-button').prop('disabled', !all_questions_answered);
    });
}

// An object for a Question, which contains the question, the correct choice, and wrong choices. This block is the constructor.
let Question = function(question_string, correct_choice, wrong_choices) {
    // Private fields for an instance of a Question object.
    this.question_string = question_string;
    this.choices = [];
    this.user_choice_index = null; // Index of the user's choice selection

    // Random assign the correct choice an index
    this.correct_choice_index = Math.floor(Math.random() * wrong_choices.length + 1);

    // Fill in this.choices with the choices
    let number_of_choices = wrong_choices.length + 1;
    for (let i = 0; i < number_of_choices; i++) {
        if (i === this.correct_choice_index) {
            this.choices[i] = correct_choice;
        } else {
            // Randomly pick a wrong choice to put in this index
            let wrong_choice_index = Math.floor(Math.random(0, wrong_choices.length));
            this.choices[i] = wrong_choices[wrong_choice_index];

            // Remove the wrong choice from the wrong choice array so that we don't pick it again
            wrong_choices.splice(wrong_choice_index, 1);
        }
    }
}

// A function that you can enact on an instance of a question object. This function is called render() and takes in a letiable called the container, which is the <div> that I will render the question in. This question will "return" with the score when the question has been answered.
Question.prototype.render = function(container) {
    // For when we're out of scope
    let self = this;

    // Fill out the question label
    let question_string_h2;
    if (container.children('h2').length === 0) {
        question_string_h2 = $('<h2>').appendTo(container);
    } else {
        question_string_h2 = container.children('h2').first();
    }
    question_string_h2.text(this.question_string);

    // Clear any radio buttons and create new ones
    if (container.children('input[type=radio]').length > 0) {
        container.children('input[type=radio]').each(function() {
            let radio_button_id = $(this).attr('id');
            $(this).remove();
            container.children('label[for=' + radio_button_id + ']').remove();
        });
    }
    for (let i = 0; i < this.choices.length; i++) {
        // Create the radio button
        let choice_radio_button = $('<input>')
            .attr('id', 'choices-' + i)
            .attr('type', 'radio')
            .attr('name', 'choices')
            .attr('value', 'choices-' + i)
            .attr('checked', i === this.user_choice_index)
            .appendTo(container);

        // Create the label
        let choice_label = $('<label>')
            .text(this.choices[i])
            .attr('for', 'choices-' + i)
            .appendTo(container);
    }

    // Add a listener for the radio button to change which one the user has clicked on
    $('input[name=choices]').change(function(index) {
        let selected_radio_button_value = $('input[name=choices]:checked').val();

        // Change the user choice index
        self.user_choice_index = parseInt(selected_radio_button_value.substr(selected_radio_button_value.length - 1, 1));

        // Trigger a user-select-change
        container.trigger('user-select-change');
    });
}

// "Main method" which will create all the objects and render the Quiz.
$(document).ready(function() {
    // Create an instance of the Quiz object
    let quiz = new Quiz('');

    // Create Question objects from all_questions and add them to the Quiz object
    for (let i = 0; i < all_questions.length; i++) {
        // Create a new Question object
        let question = new Question(all_questions[i].question_string, all_questions[i].choices.correct, all_questions[i].choices.wrong);

        // Add the question to the instance of the Quiz object that we created previously
        quiz.add_question(question);
    }

    // Render the quiz
    let quiz_container = $('#quiz');
    quiz.render(quiz_container);
});