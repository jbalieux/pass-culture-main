import { FormikProvider, useFormik } from 'formik'
import { MultiSelectAutocomplete, Select, TextArea, TextInput } from 'ui-kit'
import React, { useEffect, useState } from 'react'

import { CollectiveDataFormValues } from './type'
import FormLayout from 'new_components/FormLayout'
import { SelectOption } from 'custom_types/form'
import { StudentLevels } from 'apiClient/v1'
import { handleAllFranceDepartmentOptions } from './utils/handleAllFranceDepartmentOptions'
import { interventionOptions } from './interventionOptions'
import styles from './CollectiveDataForm.module.scss'
import { validationSchema } from './validationSchema'

const initialValues: CollectiveDataFormValues = {
  collectiveDescription: '',
  collectiveStudents: [],
  collectiveWebsite: '',
  collectivePhone: '',
  collectiveEmail: '',
  collectiveDomains: [],
  collectiveLegalStatus: '',
  collectiveNetwork: [],
  collectiveInterventionArea: [],
}

const studentOptions = [
  { value: StudentLevels.COLL_GE_4E, label: StudentLevels.COLL_GE_4E },
  { value: StudentLevels.COLL_GE_3E, label: StudentLevels.COLL_GE_3E },
  { value: StudentLevels.CAP_1RE_ANN_E, label: StudentLevels.CAP_1RE_ANN_E },
  { value: StudentLevels.CAP_2E_ANN_E, label: StudentLevels.CAP_2E_ANN_E },
  { value: StudentLevels.LYC_E_SECONDE, label: StudentLevels.LYC_E_SECONDE },
  { value: StudentLevels.LYC_E_PREMI_RE, label: StudentLevels.LYC_E_PREMI_RE },
  {
    value: StudentLevels.LYC_E_TERMINALE,
    label: StudentLevels.LYC_E_TERMINALE,
  },
]

type CollectiveDataFormProps = {
  statuses: SelectOption[]
  domains: SelectOption[]
  culturalPartners: SelectOption[]
}

const CollectiveDataForm = ({
  statuses,
  domains,
  culturalPartners,
}: CollectiveDataFormProps): JSX.Element => {
  const [previousInterventionValues, setPreviousInterventionValues] = useState<
    string[] | null
  >(null)

  const formik = useFormik<CollectiveDataFormValues>({
    initialValues,
    onSubmit: () => {},
    validationSchema,
  })

  useEffect(() => {
    handleAllFranceDepartmentOptions(
      formik.values.collectiveInterventionArea,
      previousInterventionValues,
      formik.setFieldValue
    )

    setPreviousInterventionValues(formik.values.collectiveInterventionArea)
  }, [formik.values.collectiveInterventionArea])

  return (
    <FormikProvider value={formik}>
      <form onSubmit={formik.handleSubmit}>
        <div className={styles.section}>Présentation de votre démarche EAC</div>
        <FormLayout.Row>
          <TextArea
            name="collectiveDescription"
            label="Ajoutez des informations complémentaires  concernant l’EAC."
            placeholder="Détaillez ici des informations complémentaires"
            maxLength={500}
            countCharacters
          />
        </FormLayout.Row>
        <FormLayout.Row>
          <MultiSelectAutocomplete
            fieldName="collectiveStudents"
            label="Public cible :"
            options={studentOptions}
            placeholder="Sélectionner un public cible"
            inline
            className={styles.row}
            hideTags
          />
        </FormLayout.Row>
        <FormLayout.Row>
          <TextInput
            name="collectiveWebsite"
            label="URL de votre site web :"
            placeholder="http://exemple.com"
            inline
            className={styles.row}
          />
        </FormLayout.Row>
        <div className={styles.section}>
          Informations du lieu relatives à l’EAC
        </div>
        <FormLayout.Row>
          <MultiSelectAutocomplete
            hideTags
            options={domains}
            fieldName="collectiveDomains"
            label="Domaine artistique et culturel :"
            placeholder="Sélectionner un ou plusieurs domaine(s)"
            className={styles.row}
            inline
          />
        </FormLayout.Row>
        <FormLayout.Row>
          <MultiSelectAutocomplete
            hideTags
            options={interventionOptions}
            fieldName="collectiveInterventionArea"
            label="Périmètre d’intervention :"
            placeholder="Séléctionner un territoire cible"
            className={styles.row}
            inline
          />
        </FormLayout.Row>
        <FormLayout.Row>
          <Select
            options={[
              { value: '', label: 'Sélectionner un statut' },
              ...statuses,
            ]}
            name="collectiveLegalStatus"
            label="Statut :"
            className={styles.row}
            placeholder="Association, établissement public..."
            inline
          />
        </FormLayout.Row>
        <FormLayout.Row>
          <MultiSelectAutocomplete
            options={culturalPartners}
            fieldName="collectiveNetwork"
            label="Réseaux partenaires EAC  :"
            className={styles.row}
            placeholder="Sélectionner un ou plusieurs réseaux partenaires"
            inline
            maxDisplayOptions={20}
            maxDisplayOptionsLabel="20 résultats maximum. Veuillez affiner votre recherche"
          />
        </FormLayout.Row>
        <div className={styles.section}>Contact pour les scolaires</div>
        <FormLayout.Row>
          <TextInput
            name="collectivePhone"
            label="Téléphone :"
            placeholder="0648592819"
            inline
            className={styles.row}
          />
        </FormLayout.Row>
        <FormLayout.Row>
          <TextInput
            name="collectiveEmail"
            label="E-mail :"
            placeholder="email@exemple.com"
            inline
            className={styles.row}
          />
        </FormLayout.Row>
      </form>
    </FormikProvider>
  )
}

export default CollectiveDataForm