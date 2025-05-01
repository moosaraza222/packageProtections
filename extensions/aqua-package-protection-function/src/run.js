// @ts-check

/**
 * @typedef {import("../generated/api").RunInput} RunInput
 * @typedef {import("../generated/api").FunctionRunResult} FunctionRunResult
 */

/**
 * @type {FunctionRunResult}
 */
const NO_CHANGES = {
  operations: [],
};

/**
 * @param {RunInput} input
 * @returns {FunctionRunResult}
 */
export function run(input) {
  // Package protection product title
  const PACKAGE_PROTECTION_TITLE = "AQUA Package Protection";
  
  // Find the package protection line by product title (case insensitive)
  const packageProtectionLine = input.cart.lines.find(line => 
    line.merchandise.__typename === "ProductVariant" && 
    line.merchandise.product?.title.toLowerCase() === PACKAGE_PROTECTION_TITLE
  );
  
  // If package protection is not in the cart, return no changes
  if (!packageProtectionLine) {
    return NO_CHANGES;
  }
  
  // Get cart lines excluding the package protection
  const cartLinesExcludingProtection = input.cart.lines.filter(line => 
    line.merchandise.__typename !== "ProductVariant" || 
    (line.merchandise.product?.title.toLowerCase() !== PACKAGE_PROTECTION_TITLE)
  );
  
  // Calculate the actual cart value by summing the cost of each line
  let cartValue = 0;
  
  console.log("Cart lines excluding protection:", cartLinesExcludingProtection.length);
  
  for (const line of cartLinesExcludingProtection) {
    if (line.cost && line.cost.totalAmount) {
      const lineAmount = parseFloat(line.cost.totalAmount.amount);
      console.log("Line amount:", lineAmount, "for product:", line.merchandise);
      cartValue += lineAmount;
    } else {
      console.log("Missing cost information for line:", line);
    }
  }
  
  console.log("Total cart value:", cartValue);
  
  // Calculate 2% of the cart value
  const rawPrice = cartValue * 0.02;
  console.log("Raw price (2% of cart):", rawPrice);
  
  // Round to the nearest whole number
  const protectionPrice = Math.round(rawPrice);
  console.log("Rounded price:", protectionPrice);
  
  // Ensure minimum price of 1
  const finalPrice = Math.max(1, protectionPrice);
  console.log("Final price:", finalPrice);
  
  // Return an update operation to set the price of the package protection
  return {
    operations: [
      {
        update: {
          cartLineId: packageProtectionLine.id,
          price: {
            adjustment: {
              fixedPricePerUnit: {
                amount: finalPrice.toString()
              }
            }
          }
        }
      }
    ]
  };
}