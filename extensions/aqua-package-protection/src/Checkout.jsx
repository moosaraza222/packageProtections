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
export default reactExtension("purchase.checkout.block.render", () => (
  <Extension />
));

function Extension() {
  const { i18n, sessionToken } = useApi();
  const applyCartLinesChange = useApplyCartLinesChange();
  const cartLines = useCartLines();
  const totalAmount = useTotalAmount();
  const attributes = useAttributes();


  const packageProtectionLine = cartLines.find(line => 
    line.attributes.some(attr => attr.key === 'package_protection' && attr.value === 'true')
  );

console.log(packageProtectionLine,'checking package protection');

  const isPackageProtectionEnabled = attributes.some(
    attr => attr.key === "packageProtected" && attr.value === "Added"
  );


  // Handle package protection state
  React.useEffect(() => {
    // If protection is enabled but we have 0 items, add one
    if (isPackageProtectionEnabled && !packageProtectionLine) {
    
      addPackageProtection();
    }else if(!isPackageProtectionEnabled && packageProtectionLine){
      removePackageProtection(packageProtectionLine);
    }
 
  }, [isPackageProtectionEnabled]);

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

  async function removePackageProtection(line) {
    console.log('removing package protection');
    try {
      const result = await applyCartLinesChange({
        type: 'removeCartLine',
        id: line.id,
        quantity: line.quantity
      }); 
      if (result.type === 'error') {
        console.error(result.message);
      }
    } catch (error) {
      console.error(error);
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