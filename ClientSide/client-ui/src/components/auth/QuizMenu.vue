<template>
    <main class="vignette bg-black/40">

        <body class="flex justify-center mt-[12%] font-medium text-white">

            <div v-if="playerData.quiz_question_data.length == 0 || fetching" class="text-center" :class="baseStyle">
                Loading quiz data from server...

                <div class="mt-4">
                    <LoadingSpinner />
                </div>
            </div>

            <div v-else>
                <div :class="baseStyle">

                    <p class="hidden">
                        qasd {{ currentQuestion }}
                    </p>

                    <div v-if="stage == -1">
                        You have entered the quiz stage.
                    </div>

                    <div v-if="stage == -2">
                        You have completed all the multiple choice questions.
                    </div>

                    <div v-else-if="stage >= 0" class="relative">

                        <p class="absolute right-0">
                            {{ stage }} / {{ maxQuestions }}
                        </p>

                        <p>
                            {{ currentQuestion.question }}
                        </p>

                    </div>
                </div>

                <div class="mt-10" :class="baseStyle">

                    <Transition name="fade">
                        <div v-if="stage == -1">

                            <p>
                                There are {{ maxQuestions }} multiple choice questions you have to answer. If these
                                questions
                                are answered correctly you will be able to create a character and play on the server.

                                <br>
                                <br>

                                These questions will be a test of your knowledge of server rules and GTAV roleplay so
                                ensure
                                you
                                have thoroughly read through our provided rules and have an in-depth understanding of
                                GTAV
                                roleplay before begining this quiz.

                                <br>
                                <br>

                                If you fail the multiple choice questions don't worry you will be able to redo it in {{
                quizCooldownTimeMinutes }} minutes.
                            </p>
                        </div>

                        <div v-if="stage == -2">

                            <p class="text-center" v-if="playerData.quiz_given_answers_data.passedQuiz">
                                Congratulations you have <font class="text-green-400 font-bold">successfully passed
                                </font>
                                the quiz.

                                <br>
                                <br>

                                You can now create a character and begin roleplaying on the server by clicking the
                                button
                                below!
                            </p>

                            <p class="text-center" v-else>
                                You have <font class="text-red-400 font-bold">failed</font>
                                the quiz. You got {{ playerData.quiz_given_answers_data.questionsWrong }} question(s)
                                wrong.

                                <br>
                                <br>

                                You can retake the quiz in {{ quizCooldownTimeMinutes }} minutes.
                            </p>

                        </div>


                        <div v-else-if="stage >= 0">
                            <div v-for="(item, idx) in currentQuestion.answers" :key="idx">
                                <button
                                    class="p-4 border-b-4 w-full text-left border-gray-400/50 duration-300 hover:border-green-400/30"
                                    @click="addAnswer({
                questionId: currentQuestion.questionId,
                answerId: idx
            })" :class="clickedOnAnswer.answerId === idx ? 'border-green-400/30' : ''">
                                    <p>{{ idx }}. {{ item }} </p>
                                </button>
                            </div>
                        </div>

                    </Transition>
                </div>

                <div>
                    <Transition name="fade">

                        <button v-if="stage == -1" @click="stage = 0"
                            class="shadow-2xl shadow-black mt-10 w-[35vw] bg-black/70 p-3 text-center rounded-xl border-b-4 border-green-400/50 duration-300 hover:scale-105 hover:border-green-400/70">
                            Continue
                        </button>

                        <button v-else-if="Object.entries(this.clickedOnAnswer).length > 0 && stage >= 0"
                            @click="iterateNextStage"
                            class="shadow-2xl shadow-black mt-10 w-[35vw] bg-black/70 p-3 text-center rounded-xl border-b-4 border-green-400/50 duration-300 hover:scale-105 hover:border-green-400/70">
                            Next Question
                        </button>

                        <button v-if="stage == -2 && playerData.quiz_given_answers_data.passedQuiz"
                            @click="characterSelection"
                            class="shadow-2xl shadow-black mt-10 w-[35vw] bg-black/70 p-3 text-center rounded-xl border-b-4 border-green-400/50 duration-300 hover:scale-105 hover:border-green-400/70">
                            Go to character selection
                        </button>

                    </Transition>
                </div>


            </div>



        </body>

    </main>
</template>

<script>
import { mapGetters } from 'vuex';
import LoadingSpinner from '../ui/LoadingSpinner.vue'
import { sendToServer } from '@/helpers';

export default {
    data() {
        return {
            currentQuestion: null,
            fetching: false,
            givenAnswers: [],
            clickedOnAnswer: {},
            stage: -1,
            maxQuestions: 0,
            quizCooldownTimeMinutes: 60,
            baseStyle: "bg-black/70 border-t-4 border-b-4 border-purple-400/50 w-[35vw] p-4 rounded-xl shadow-2xl shadow-black"
        }
    },
    components: {
        LoadingSpinner
    },
    computed: {
        ...mapGetters({
            playerData: 'getPlayerInfo'
        })
    },
    created() {
        this.fetching = true;

        setTimeout(() => {
            this.fetching = false;

            if (!this.playerData.quiz_question_data.length === 0) return this.created();

            this.currentQuestion = this.playerData.quiz_question_data[0];
            this.maxQuestions = this.playerData.quiz_question_data.length;

            if (Object.entries(this.playerData.quiz_given_answers_data).length !== 0) {
                this.stage = -2;
            }
        }, 1500);

    },
    methods: {
        iterateNextStage() {
            if (Object.entries(this.clickedOnAnswer).length == 0) return;

            if (this.stage + 1 === this.playerData.quiz_question_data.length) return this.getQuizResults();

            this.stage++;

            this.givenAnswers.push(this.clickedOnAnswer);

            this.currentQuestion = this.playerData.quiz_question_data[this.stage];
            this.clickedOnAnswer = {};
        },
        getQuizResults() {
            this.fetching = true;
            this.stage = -2;

            sendToServer("server:authentication:handleQuizResults", JSON.stringify(this.givenAnswers));

            setTimeout(() => {
                this.fetching = false;
            }, 2000);
        },
        addAnswer(item) {
            if (this.clickedOnAnswer.answerId === item.answerId) {
                this.clickedOnAnswer = {};
                return;
            }

            this.clickedOnAnswer = item;
        },
        characterSelection() {
            sendToServer("server:authentication:beginSelection");
        }
    }
}
</script>