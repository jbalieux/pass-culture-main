import cn from 'classnames'
import React, { MouseEventHandler, useRef } from 'react'
import { Link } from 'react-router-dom'

import { ReactComponent as IcoArrowRight } from 'icons/ico-mini-arrow-right.svg'

import styles from './Button.module.scss'
import { ButtonVariant, IconPositionEnum, SharedButtonProps } from './types'
import useTooltipMargin from './useTooltipMargin'

export type LinkProps = {
  isExternal: boolean
  to: string
  rel?: string
  target?: string
  'aria-label'?: string
  type?: string
}
interface IButtonProps extends SharedButtonProps {
  link: LinkProps
  children?: React.ReactNode | React.ReactNode[]
  className?: string
  isDisabled?: boolean
  onClick?: MouseEventHandler<HTMLAnchorElement>
  hasTooltip?: boolean
}

const ButtonLink = ({
  className,
  children,
  Icon,
  isDisabled = false,
  onClick,
  variant = ButtonVariant.TERNARY,
  link,
  iconPosition = IconPositionEnum.LEFT,
  hasTooltip = false,
}: IButtonProps): JSX.Element => {
  const tooltipRef = useRef<HTMLDivElement>(null)
  const tooltipMargin = useTooltipMargin(tooltipRef, children)

  const classNames = cn(
    styles['button'],
    styles[`button-${variant}`],
    styles[`button-${iconPosition}`],
    { [styles[`button-disabled`]]: isDisabled },
    className
  )
  const renderBody = () => (
    <>
      {
        /* istanbul ignore next: graphic variation */
        Icon && iconPosition !== IconPositionEnum.RIGHT && (
          <Icon className={styles['button-icon']} />
        )
      }
      {hasTooltip ? (
        <div
          className={styles.tooltip}
          data-testid="tooltip"
          ref={tooltipRef}
          style={{ marginTop: tooltipMargin }}
        >
          {children}
        </div>
      ) : /* istanbul ignore next: graphic variation */ variant ===
        ButtonVariant.BOX ? (
        <div className={styles['button-arrow-content']}>{children}</div>
      ) : (
        children
      )}
      {
        /* istanbul ignore next: graphic variation */
        Icon && iconPosition === IconPositionEnum.RIGHT && (
          <Icon className={styles['button-icon']} />
        )
      }
      {
        /* istanbul ignore next: graphic variation */ variant ===
          ButtonVariant.BOX && (
          <IcoArrowRight
            className={cn(styles['button-icon'], styles['button-icon-arrow'])}
          />
        )
      }
    </>
  )
  const { to, isExternal, ...linkProps } = link

  const callback: MouseEventHandler<HTMLAnchorElement> = e =>
    isDisabled ? e.preventDefault() : onClick?.(e)

  const disabled = isDisabled
    ? {
        'aria-disabled': true,
      }
    : {}

  return isExternal ? (
    <a
      className={classNames}
      href={to}
      onClick={callback}
      {...disabled}
      {...linkProps}
    >
      {renderBody()}
    </a>
  ) : (
    /* istanbul ignore next: graphic variation */ <Link
      className={classNames}
      onClick={callback}
      to={to}
      {...disabled}
    >
      {renderBody()}
    </Link>
  )
}

ButtonLink.variant = ButtonVariant

export default ButtonLink
