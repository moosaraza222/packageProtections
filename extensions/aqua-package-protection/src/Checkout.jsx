import {
  reactExtension,
  BlockStack,
  Text,
  Image,
  useApi,
  useCartLines,
  useApplyCartLinesChange,
  useExtensionCapability,
  useTotalAmount,
  useAttributes,
} from "@shopify/ui-extensions-react/checkout";
import React from "react";
// Use the post-purchase.checkout.cart-line-item.render-after target to appear below discount code
export default reactExtension("purchase.checkout.cart-line-list.render-after", () => (
  <Extension />
));

function Extension() {
  const { i18n } = useApi();
  const applyCartLinesChange = useApplyCartLinesChange();
  const cartLines = useCartLines();
  const totalAmount = useTotalAmount();
  const attributes = useAttributes();
  console.log(attributes, "attributes")
  
  
  // Check if package protection is already in the cart
  const packageProtectionLine = cartLines.find(line => 
    line.merchandise.id === "gid://shopify/ProductVariant/44130745417914" ||
    line.merchandise.product?.title === "aqua package protection"
  );
  
console.log(packageProtectionLine, "packageProtectionLine")
  const isPackageProtectionEnabled = attributes.some(
    attr => attr.key === "packageProtected" && attr.value === "Added"
  );
  console.log(isPackageProtectionEnabled, "isPackageProtectionEnabled")
  // Add or remove package protection based on attribute
  React.useEffect(() => {
    if (isPackageProtectionEnabled && !packageProtectionLine) {
      // Add package protection if attribute is set but product is not in cart
      addPackageProtection();
    } else if (!isPackageProtectionEnabled && packageProtectionLine) {
      // Remove package protection if attribute is not set but product is in cart
      removePackageProtection();
    }
  }, [isPackageProtectionEnabled, packageProtectionLine]);

  async function addPackageProtection() {
    try {
      const result = await applyCartLinesChange({
        type: 'addCartLine',
        merchandiseId: 'gid://shopify/ProductVariant/44130745417914',
        quantity: 1,
        attributes: [{ key: 'package_protection', value: 'true' }]
      });
      
      if (result.type === 'error') {
        console.error(result.message);
      }
    } catch (error) {
      console.error(error);
    }
  }

  async function removePackageProtection() {
    try {
      if (packageProtectionLine) {
        const result = await applyCartLinesChange({
          type: 'removeCartLine',
          id: packageProtectionLine.id,
          quantity: packageProtectionLine.quantity
        });
        
        if (result.type === 'error') {
          console.error("Error removing package protection:", result.message);
        }
      }
    } catch (error) {
      console.error("Exception removing package protection:", error);
    }
  }

  // Only render information if package protection is enabled
  if (isPackageProtectionEnabled) {
    return (
     <></>
    );
  }
  
  // Return null if package protection is not enabled
  return null;
}