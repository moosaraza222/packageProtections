import {
  reactExtension,
  useApi,
  useTranslate,
  useCartLines,
  useApplyCartLinesChange,
  useTotalAmount,
} from "@shopify/ui-extensions-react/checkout";
import { useEffect, useState } from "react";

// Define the gift variant ID using the GID format
const GIFT_VARIANT_ID = "gid://shopify/ProductVariant/44130744828090";

// 1. Choose an extension target
export default reactExtension("purchase.checkout.block.render", () => (
  <Extension />
));

function Extension() {
  const applyCartLinesChange = useApplyCartLinesChange();
  const lines = useCartLines();
  const totalAmount = useTotalAmount();
  const [isUpdating, setIsUpdating] = useState(false);

  // Use useEffect to react to changes in cart lines or total amount
  useEffect(() => {
    const handleCartUpdate = async () => {
      // Prevent concurrent updates
      if (isUpdating) {
        console.log("Update already in progress, skipping.");
        return;
      }

      // Ensure totalAmount and lines are loaded
      if (!totalAmount || !lines) {
        console.log("Waiting for totalAmount and lines data...");
        return;
      }

      const cartTotal = totalAmount.amount;
      let targetQuantity = 0;

      // Determine target quantity based on cart total
      if (cartTotal >= 999) {
        targetQuantity = 2;
      } else if (cartTotal >= 599) {
        targetQuantity = 1;
      }

      // Find the gift product line item if it exists
      const existingGiftLine = lines.find(
        (line) => line.merchandise.id === GIFT_VARIANT_ID
      );
      const currentQuantity = existingGiftLine ? existingGiftLine.quantity : 0;

      // Only proceed if the target quantity differs from the current quantity
      if (currentQuantity === targetQuantity) {
        console.log(
          `Gift quantity (${currentQuantity}) is already correct for total $${cartTotal}. No changes needed.`
        );
        return;
      }

      console.log(
        `Cart total $${cartTotal}. Target quantity: ${targetQuantity}. Current quantity: ${currentQuantity}. Applying changes.`
      );

      setIsUpdating(true);
      try {
        // Remove the item if target is 0 and it exists
        if (targetQuantity === 0 && existingGiftLine) {
          console.log(`Removing gift item (ID: ${existingGiftLine.id})`);
          const result = await applyCartLinesChange({
            type: "removeCartLine",
            id: existingGiftLine.id,
            quantity: currentQuantity, // Required quantity to remove
          });
          if (result.type === "error") {
            console.error("Error removing gift item:", result.message);
          } else {
            console.log("Successfully removed gift item.");
          }
        }
        // Add the item if target > 0 and it doesn't exist
        else if (targetQuantity > 0 && !existingGiftLine) {
          console.log(
            `Adding gift item (Variant ID: ${GIFT_VARIANT_ID}, Quantity: ${targetQuantity})`
          );
          const result = await applyCartLinesChange({
            type: "addCartLine",
            merchandiseId: GIFT_VARIANT_ID,
            quantity: targetQuantity,
          });
          if (result.type === "error") {
            console.error("Error adding gift item:", result.message);
          } else {
            console.log("Successfully added gift item.");
          }
        }
        // Update the item if target > 0 and it exists with a different quantity
        else if (
          targetQuantity > 0 &&
          existingGiftLine &&
          currentQuantity !== targetQuantity
        ) {
          console.log(
            `Updating gift item quantity (ID: ${existingGiftLine.id}, New Quantity: ${targetQuantity})`
          );
          const result = await applyCartLinesChange({
            type: "updateCartLine",
            id: existingGiftLine.id,
            quantity: targetQuantity,
          });
          if (result.type === "error") {
            console.error(
              "Error updating gift item quantity:",
              result.message
            );
          } else {
            console.log("Successfully updated gift item quantity.");
          }
        }
      } catch (error) {
         console.error("An unexpected error occurred during cart update:", error);
      } finally {
        setIsUpdating(false);
      }
    };

    handleCartUpdate();
    // Dependencies ensure this effect runs when cart lines or total amount change
  }, [lines, totalAmount, applyCartLinesChange, isUpdating]);

  // This extension target requires a rendered component, but we don't need UI for this logic.
  // Render null or an empty fragment.
  return null;
}