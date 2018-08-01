import classnames from 'classnames'
import { Icon } from 'pass-culture-shared'
import React from 'react'
import { withRouter } from 'react-router'
import { compose } from 'redux'

const BackButton = ({
  history,
  match,
  location,
  staticContext,
  className,
  ...otherProps
}) => {
  return (
    <button
      className={classnames('back-button', className)}
      onClick={history.goBack}
      {...otherProps}>
      <Icon svg="ico-back-simple-w" alt="Retour" />
    </button>
  )
}

export default compose(withRouter)(BackButton)
