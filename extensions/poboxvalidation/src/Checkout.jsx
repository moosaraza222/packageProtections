import '@shopify/ui-extensions/preact';
import { render } from 'preact';

import {
  useBuyerJourneyIntercept,
  useExtensionCapability,
  useShippingAddress,
} from '@shopify/ui-extensions/checkout/preact';

export default function extension() {
  render(<Extension />, document.body);
}

const PO_BOX_REGEX =
  /\b(p\.?\s*o\.?\s*(box|bin|b\.?)|post\s+office\s*(box|bin)?)\b/i;

function Extension() {
  const editorType = shopify.extension.editor?.type;
  const blockProgressGranted = useExtensionCapability('block_progress');

  // Subscribe to the shipping address so the signal is hydrated when the interceptor runs
  const address = useShippingAddress();

  useBuyerJourneyIntercept(({ canBlockProgress }) => {
    const addr1 = address?.address1 ?? '';
    const addr2 = address?.address2 ?? '';

    console.log('[poboxvalidation] intercept fired', { canBlockProgress, addr1, addr2 });

    const address1HasPOBox = PO_BOX_REGEX.test(addr1);
    const address2HasPOBox = PO_BOX_REGEX.test(addr2);
    const addressLinesAvailable = addr1 || addr2;
    const hasPOBox = address1HasPOBox || address2HasPOBox;

    if (canBlockProgress && addressLinesAvailable && hasPOBox) {
      const target = address1HasPOBox
        ? '$.cart.deliveryGroups[0].deliveryAddress.address1'
        : '$.cart.deliveryGroups[0].deliveryAddress.address2';

      return {
        behavior: 'block',
        reason: 'Address has PO box',
        errors: [
          {
            message: 'We are unable to ship to P.O. Box addresses. A valid residential or commercial street address is required to complete your order.',
            target,
          },
          {
            message: 'Please use a different address.',
          },
        ],
      };
    }

    return { behavior: 'allow' };
  });

  return editorType === 'checkout' && !blockProgressGranted ? (
    <s-banner tone="warning" heading="This app may be misconfigured">
      To allow this app to block checkout, enable this behavior in "Checkout
      behavior" settings.
    </s-banner>
  ) : null;
}
