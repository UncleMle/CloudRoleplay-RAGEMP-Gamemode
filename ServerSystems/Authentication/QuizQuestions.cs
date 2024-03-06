using System;
using System.Collections.Generic;
using System.Text;

namespace CloudRP.ServerSystems.Authentication
{
    public class QuizQuestions
    {
        public static List<QuizQuestion> questions = new List<QuizQuestion>
        {
            new QuizQuestion
            {
                questionId = 1,
                question = "Which of the following actions is generally considered a violation of GTAV roleplay rules?",
                answers = new List<string>
                {
                    "Using third-party mods to gain an unfair advantage",
                    "Engaging in consensual roleplay scenarios with other players",
                    "Reporting bugs and glitches to server administrators",
                    "Organizing community events within the game world"
                },
                answerId = 0 
            },
            new QuizQuestion
            {
                questionId = 2,
                question = "In GTAV roleplay, what does 'metagaming' refer to?",
                answers = new List<string>
                {
                    "Using in-game resources to advance your character's storyline",
                    "Making decisions based on out-of-character knowledge not obtained through roleplay",
                    "Cooperating with other players to complete in-game missions",
                    "Enhancing game graphics for better immersion"
                },
                answerId = 1 
            },
            new QuizQuestion
            {
                questionId = 3,
                question = "Which of the following is an example of 'powergaming' in GTAV roleplay?",
                answers = new List<string>
                {
                    "Following the rules and guidelines set by the server administrators",
                    "Helping new players understand the mechanics of the game",
                    "Organizing community events and competitions",
                    "Forcing other players into situations where they have no chance of success",
                },
                answerId = 3
            },
            new QuizQuestion
            {
                questionId = 4,
                question = "What is the primary purpose of 'character creation rules' in GTAV roleplay servers?",
                answers = new List<string>
                {
                    "To restrict players from customizing their characters",
                    "To ensure that characters fit within the lore and setting of the server",
                    "To encourage players to use generic character models provided by the game",
                    "To limit the number of characters each player can create"
                },
                answerId = 1
            },
            new QuizQuestion
            {
                questionId = 5,
                question = "Which of the following behaviors is generally discouraged in GTAV roleplay?",
                answers = new List<string>
                {
                    "Engaging in toxic behavior and harassment towards other players",
                    "Respecting the personal space of other players during roleplay interactions",
                    "Actively participating in server events and community activities",
                    "Creating unique backstories and personalities for your characters"
                },
                answerId = 0
            },
            new QuizQuestion
            {
                questionId = 6,
                question = "In GTAV roleplay, what does 'fail roleplay' typically refer to?",
                answers = new List<string>
                {
                    "Successfully executing a complex roleplay scenario",
                    "Experiencing technical issues while playing the game",
                    "Engaging in unrealistic or out-of-character actions during roleplay",
                    "Achieving a high level of skill in in-game activities"
                },
                answerId = 2
            },
            new QuizQuestion
            {
                questionId = 7,
                question = "Which of the following actions would likely result in a ban on most GTAV roleplay servers?",
                answers = new List<string>
                {
                    "Adhering strictly to the rules and guidelines provided by server administrators",
                    "Exploiting glitches or bugs in the game to gain an advantage over other players",
                    "Providing constructive feedback to server administrators for improvement",
                    "Assisting new players in understanding the mechanics of the game"
                },
                answerId = 1
            },
            new QuizQuestion
            {
                questionId = 8,
                question = "What is the purpose of 'roleplay scenarios' in GTAV roleplay servers?",
                answers = new List<string>
                {
                    "To provide players with scripted missions and objectives",
                    "To limit player freedom and creativity within the game world",
                    "To encourage spontaneous and immersive interactions between players",
                    "To discourage players from engaging in roleplay activities"
                },
                answerId = 2
            },
            new QuizQuestion
            {
                questionId = 9,
                question = "Which of the following is an essential aspect of GTAV roleplay?",
                answers = new List<string>
                {
                    "Maximizing in-game profits through efficient resource management",
                    "Completing predefined objectives and missions provided by the game",
                    "Building a strong social network within the gaming community",
                    "Creating a rich and immersive storyline for your character",
                },
                answerId = 3
            },
            new QuizQuestion
            {
                questionId = 10,
                question = "What role do server administrators play in GTAV roleplay?",
                answers = new List<string>
                {
                    "They actively participate in roleplay scenarios alongside other players",
                    "They enforce rules and guidelines to ensure fair and enjoyable gameplay",
                    "They provide technical support for players experiencing issues in the game",
                    "They organize community events and competitions for players to enjoy"
                },
                answerId = 1
            }
        };
    };
}
