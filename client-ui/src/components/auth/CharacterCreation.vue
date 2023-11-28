<template>

    <main>
        <div class="fixed inset-0 w-full text-white text-lg">
                <div class="max-w-xl ml-10 mt-10">
                    <div class="rounded-xl font-medium text-white w-full bg-black/70 shadow-2xl shadow-black border-gray-500 select-none">
                      <div class="flex border-b-2 border-gray-400">
                          <div class="p-3 text-xl">

                              <i class="fa-solid fa-person-half-dress text-gray-400 pr-2"></i>Character Creation
                          </div>
                      </div>

                            <ui class="flex justify-center mt-2 space-x-10 border-b-2 pb-2 border-gray-400">
                                <button @click="browsingType = 'General'" class="hover:text-green-500 duration-300"><i class="fa-solid fa-gear"></i><br /><span class="text-gray-300">General</span></button>
                                <button @click="browsingType = 'Face'" class="hover:text-green-500 duration-300"><i class="fa-solid fa-face-smile"></i><br /><span class="text-gray-300">Face</span></button>
                                <button @click="browsingType = 'Hair'" class="hover:text-green-500 duration-300"><i class="fa-solid fa-user"></i><br /><span class="text-gray-300">Hair</span></button>
                                <button @click="browsingType = 'Misc'" class="hover:text-green-500 duration-300"><i class="fa-solid fa-shirt"></i><br /><span class="text-gray-300">Misc</span></button>
                            </ui>

                        
                    <div class="h-[34vw] overflow-x-scroll overlow-hidden">
                        
                        <div v-if="browsingType == 'General'">
                            General
                        </div>


                     </div>
                    
                    
                    </div>
                    </div>
                </div>
        </main>
</template>

<script>
    export default {

        data() {
            return {
                browsingType: "General",
                characterData: {
                    fname: "",
                    lname: ""
                }
            }
        }

    }

</script>