import * as yup from 'yup'

const validationSchema = {
  isVenueVirtual: yup.boolean(),
  addressAutocomplete: yup.string().when('isVenueVirtual', {
    is: false,
    then: yup
      .string()
      .required('Veuillez sélectionner une adresse parmi les suggestions'),
  }),
}

export default validationSchema
