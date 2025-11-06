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
  const canUpdateCart = useExtensionCapability('block_progress');

  // Use ref to track if customer manually removed package protection (persists across renders without causing re-renders)
  const customerRemovedProtection = React.useRef(false);
  const lastProtectionState = React.useRef(false);
  const isAddingProtection = React.useRef(false);

  const packageProtectionLine = cartLines.find(line => 
    line.attributes?.some(attr => attr.key === 'package_protection' && attr.value === 'true')
  );

  // Check if there are other products in cart (excluding package protection)
  const hasOtherProducts = cartLines.some(line => 
    !line.attributes?.some(attr => attr.key === 'package_protection' && attr.value === 'true')
  );

  // Use boolean to avoid object reference issues in useEffect
  const hasPackageProtection = !!packageProtectionLine;
  const packageProtectionId = packageProtectionLine?.id;

  console.log('Package Protection Debug:', {
    hasOtherProducts,
    hasPackageProtection,
    totalCartLines: cartLines.length,
    canUpdateCart,
    cartLinesData: cartLines.map(line => ({
      id: line.id,
      title: line.merchandise?.title,
      attributes: line.attributes
    }))
  });

  // Define functions before useEffect
  const addPackageProtection = React.useCallback(async () => {
    console.log('addPackageProtection function called');
    isAddingProtection.current = true;
    try {
      const result = await applyCartLinesChange({
        type: 'addCartLine',
        merchandiseId: 'gid://shopify/ProductVariant/41998665416932',
        quantity: 1,
        attributes: [{ key: 'package_protection', value: 'true' }]
      });
      
      console.log('addPackageProtection result:', result);
      
      if (result.type === 'error') {
        console.error('Error adding package protection:', result.message);
      } else {
        console.log('✅ Package protection added successfully');
      }
    } catch (error) {
      console.error('❌ Error in addPackageProtection:', error);
    } finally {
      isAddingProtection.current = false;
    }
  }, [applyCartLinesChange]);

  const removePackageProtection = React.useCallback(async (lineId) => {
    console.log('removePackageProtection function called for line:', lineId);
    try {
      const result = await applyCartLinesChange({
        type: 'removeCartLine',
        id: lineId,
        quantity: 1
      }); 
      
      console.log('removePackageProtection result:', result);
      
      if (result.type === 'error') {
        console.error('Error removing package protection:', result.message);
      } else {
        console.log('✅ Package protection removed successfully');
      }
    } catch (error) {
      console.error('❌ Error in removePackageProtection:', error);
    }
  }, [applyCartLinesChange]);

  // Automatically handle package protection
  React.useEffect(() => {
    // Detect if customer manually removed the protection
    if (lastProtectionState.current && !hasPackageProtection && hasOtherProducts && !isAddingProtection.current) {
      console.log('🚫 Customer manually removed package protection - will not re-add');
      customerRemovedProtection.current = true;
    }
    
    console.log('useEffect triggered:', { 
      hasOtherProducts, 
      hasPackageProtection, 
      customerRemovedProtection: customerRemovedProtection.current,
      isAddingProtection: isAddingProtection.current
    });
    
    // If there are other products but no package protection, add it
    // BUT only if customer hasn't manually removed it
    if (hasOtherProducts && !hasPackageProtection && !customerRemovedProtection.current && !isAddingProtection.current) {
      console.log('✅ Adding package protection automatically...');
      addPackageProtection();
    } 
    // If there are no other products but package protection exists, remove it
    else if (!hasOtherProducts && hasPackageProtection && packageProtectionId) {
      console.log('🗑️ Removing package protection (cart empty)...');
      removePackageProtection(packageProtectionId);
      // Reset the flag when cart is empty
      customerRemovedProtection.current = false;
    }
    
    // Track the last state
    lastProtectionState.current = hasPackageProtection;
 
  }, [hasOtherProducts, hasPackageProtection, packageProtectionId, addPackageProtection, removePackageProtection]);
  

  // No UI needed - package protection is automatically added
  return null;
}