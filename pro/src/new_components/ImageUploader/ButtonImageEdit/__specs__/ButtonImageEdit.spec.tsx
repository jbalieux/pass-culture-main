import '@testing-library/jest-dom'

import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'
import { Provider } from 'react-redux'

import * as apiHelpers from 'apiClient/helpers'
import { UploaderModeEnum } from 'new_components/ImageUploader/types'
import { configureTestStore } from 'store/testUtils'

import ButtonImageEdit, { IButtonImageEditProps } from '../ButtonImageEdit'

const renderButtonImageEdit = (props: IButtonImageEditProps) => {
  const store = configureTestStore()
  return render(
    <Provider store={store}>
      <ButtonImageEdit {...props} />
    </Provider>
  )
}

describe('test ButtonImageEdit', () => {
  let props: IButtonImageEditProps
  beforeEach(() => {
    props = {
      mode: UploaderModeEnum.OFFER,
      initialValues: {},
      onImageUpload: jest.fn(),
    }
  })

  it('should render add button', async () => {
    renderButtonImageEdit(props)
    expect(
      await screen.findByRole('button', {
        name: /Ajouter une image/,
      })
    ).toBeInTheDocument()
  })

  it('should render edit button', async () => {
    props = {
      ...props,
      initialValues: {
        ...props.initialValues,
        imageUrl: 'http://test.url',
      },
    }
    renderButtonImageEdit(props)
    expect(
      await screen.findByRole('button', {
        name: /Modifier/,
      })
    ).toBeInTheDocument()
  })

  it('should open modal on click on add image button', async () => {
    renderButtonImageEdit(props)
    await userEvent.click(
      await screen.findByRole('button', {
        name: /Ajouter une image/,
      })
    )
    expect(
      await screen.findByRole('heading', {
        name: /Ajouter une image/,
      })
    ).toBeInTheDocument()
  })

  it('should render edit button', async () => {
    props = {
      ...props,
      initialValues: {
        imageUrl: 'http://test.url',
        originalImageUrl: 'http://test.url',
        credit: 'John Do',
      },
    }
    jest
      .spyOn(apiHelpers, 'getDataURLFromImageURL')
      .mockResolvedValue(new File([''], 'myThumb.png'))
    renderButtonImageEdit(props)
    await userEvent.click(
      await screen.findByRole('button', {
        name: /Modifier/,
      })
    )
    expect(
      await screen.findByRole('heading', {
        name: /Image de l'offre/,
      })
    ).toBeInTheDocument()
  })
})