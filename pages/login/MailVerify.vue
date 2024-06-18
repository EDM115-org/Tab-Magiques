<template>
  <v-container class="fillheight">
    <h1 class="text-center mt-5 mb-5">
      Vérification de l'email
    </h1>
    <p class="text-center mb-5">
      Un mail vous a été envoyé avec un code de vérification.
    </p>
    <Error
      v-if="errorMessage"
      :issue="issueMessage"
      :message="errorMessage"
      :color="messageColor"
    />
    <v-form
      ref="form"
      @submit.prevent="submitCode"
    >
      <v-row>
        <v-col cols="12">
          <v-text-field
            v-model="stateCode.code"
            :error-messages="code$.code.$errors.map(e => e.$message)"
            class="input-field mx-auto"
            label="Code de vérification"
            required
            maxlength="6"
            @blur="code$.code.$touch"
            @input="code$.code.$touch"
          />
        </v-col>
      </v-row>
      <v-row>
        <v-col
          cols="12"
          class="text-center"
        >
          <v-btn
            :disabled="code$.$invalid"
            color="secondary"
            type="submit"
            variant="elevated"
          >
            Vérifier
          </v-btn>
        </v-col>
      </v-row>
      <v-row>
        <v-col
          cols="12"
          class="text-center"
        >
          <v-btn
            color="primary"
            variant="elevated"
            @click="resendVerificationMail"
          >
            Renvoyer le mail de vérification
          </v-btn>
        </v-col>
      </v-row>
    </v-form>
  </v-container>
</template>


<script setup>
import { useMainStore } from "~/store/main"
import useVuelidate from "@vuelidate/core"
import { required, numeric, minLength, maxLength } from "@vuelidate/validators"
import { ref, reactive } from "vue"

const store = useMainStore()
const user = store.user
const router = useRouter()

const errorMessage = ref("")
const issueMessage = ref("")
const messageColor = ref("error")

const initialStateCode = {
  code: ""
}
const stateCode = reactive({ ...initialStateCode })
const rulesCode = {
  code: { required, numeric, minLength: minLength(6), maxLength: maxLength(6) }
}
const code$ = useVuelidate(rulesCode, stateCode)

async function submitCode() {
  code$.value.$touch()

  if (code$.value.$invalid) {
    return
  }

  try {
    const response = await $fetch("/api/mailVerify?type=code", {
      method: "POST",
      body: JSON.stringify({
        email: user.mail,
        code: stateCode.code
      })
    })

    if (response.statusCode === 200) {
      messageColor.value = "success"
      errorMessage.value = response.body.success
      issueMessage.value = ""
      router.push("/user")
    } else {
      messageColor.value = "error"
      errorMessage.value = response.body.error || "Erreur inconnue"
      issueMessage.value = response.body.message || ""
    }
  } catch (error) {
    console.error("Erreur lors de l'appel à l'API:", error)
    errorMessage.value = "Erreur lors de la vérification du code."
    issueMessage.value = error.message || error
  }
}

async function resendVerificationMail() {
  try {
    const response = await $fetch("/api/mailVerify?type=mail", {
      method: "POST",
      body: JSON.stringify({
        email: user.mail,
      })
    })

    if (response.statusCode === 200) {
      messageColor.value = "success"
      errorMessage.value = "Un nouveau mail de vérification a été envoyé."
      issueMessage.value = ""
    } else {
      messageColor.value = "error"
      errorMessage.value = response.body.error || "Erreur inconnue"
      issueMessage.value = response.body.message || ""
    }
  } catch (error) {
    console.error("Erreur lors de l'appel à l'API:", error)
    messageColor.value = "error"
    errorMessage.value = "Erreur lors de l'envoi du mail de vérification."
    issueMessage.value = error.message || error
  }
}
</script>