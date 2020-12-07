const LARGE_MULTIPLER = 10000000000000

const TYPE = 'webapp'

/* Beware : the same function is defined for pro and id-check */
const createTrackingIframe = cat => {
  const randomInteger = Math.random() * LARGE_MULTIPLER

  const iframe = document.createElement('iframe')
  iframe.src =
    `https://10483184.fls.doubleclick.net/activityi;src=10483184;type=${TYPE};cat=${cat};dc_lat=;dc_rdid=;tag_for_child_directed_treatment=;tfua=;npa=;` +
    'gdpr=${GDPR};gdpr_consent=${GDPR_CONSENT_755};' +
    `ord=1;num=${randomInteger}?`
  iframe.width = '1'
  iframe.height = '1'
  iframe.frameborder = '0'
  iframe.style = 'display:none'

  document.body.appendChild(iframe)
}

export const campaignTracker = {
  home: () => createTrackingIframe('passc00'),
  signin: () => createTrackingIframe('passc0'),
  eligibilityCheck: () => createTrackingIframe('lpins0'),
}
