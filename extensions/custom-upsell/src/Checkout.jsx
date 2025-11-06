
import {
  reactExtension,
  Banner,
  BlockStack,
  InlineStack,
  Text,
  Image,
  Button,
  Divider,
  Heading,
  View,
  useApi,
  useApplyCartLinesChange,
  useInstructions,
  useCartLines,
} from "@shopify/ui-extensions-react/checkout";
import { useState, useMemo } from "react";

// ============================================================
// CONFIGURATION SECTION - Update all variant IDs here
// ============================================================

// System Products - Map each system product name to its related tool variant IDs
// NOTE: Detection is based on the "name" field matching the product title (case-insensitive)
// The keys are just identifiers and not used for matching
const SYSTEM_PRODUCTS_MAP = {
  // Q Weft System Product
  "q-weft": {
    name: "Q Weft",  // This name is used to detect products in cart
    tools: [
      "gid://shopify/ProductVariant/32680546533507",  // Tail Comb
      "gid://shopify/ProductVariant/32680539390083",  // Silicone Beads - 150 pcs
      "gid://shopify/ProductVariant/32680540340355",  // Loop Tool
      "gid://shopify/ProductVariant/32680539783299",  // Deluxe Pliers
      "gid://shopify/ProductVariant/42072169939172",  // Nylon Thread
      "gid://shopify/ProductVariant/42072185045220",  // Small Scissors
      "gid://shopify/ProductVariant/32680545255555",  // Thread
      "gid://shopify/ProductVariant/46308159979748",  // Clips - 4 pcs/pack
      "gid://shopify/ProductVariant/32680547876995",  // Hair Grippers (2/pk)
      "gid://shopify/ProductVariant/32680535523459"   // Boar Bristle Brush
    ]
  },
  // Machine Weft System Product
  "machine-weft": {
    name: "Machine Weft",  // This name is used to detect products in cart
    tools: [
      "gid://shopify/ProductVariant/32680539783299",  // Deluxe Pliers
      "gid://shopify/ProductVariant/32680540340355",  // Loop Tool
      "gid://shopify/ProductVariant/32680539390083",  // Silicone Beads - 150 pcs
      "gid://shopify/ProductVariant/42072169939172",  // Nylon Thread
      "gid://shopify/ProductVariant/32680545255555",  // Thread
      "gid://shopify/ProductVariant/32680545190019",  // Weft Needles - 2 pcs/pack
      "gid://shopify/ProductVariant/42072185045220",  // Small Scissors
      "gid://shopify/ProductVariant/32680546533507",  // Tail Comb
      "gid://shopify/ProductVariant/32680547876995",  // Hair Grippers (2/pk)
      "gid://shopify/ProductVariant/46308159979748",  // Clips - 4 pcs/pack
      "gid://shopify/ProductVariant/32680535523459"   // Boar Bristle Brush
    ]
  },
  // Hand Tied Weft System Product
  "hand-tied-weft": {
    name: "Hand Tied Weft",  // This name is used to detect products in cart
    tools: [
      "gid://shopify/ProductVariant/32680540340355",  // Loop Tool
      "gid://shopify/ProductVariant/42072169939172",  // Nylon Thread
      "gid://shopify/ProductVariant/42072185045220",  // Small Scissors
      "gid://shopify/ProductVariant/32680545255555",  // Thread
      "gid://shopify/ProductVariant/32680545190019",  // Weft Needles - 2 pcs/pack
      "gid://shopify/ProductVariant/32680546533507",  // Tail Comb
      "gid://shopify/ProductVariant/46308159979748",  // Clips - 4 pcs/pack
      "gid://shopify/ProductVariant/32680547876995"   // Hair Grippers (2/pk)
    ]
  },
  // Tape In Weft System Product
  "tape-in-weft": {
    name: "Tape In Weft",  // This name is used to detect products in cart
    tools: [
      "gid://shopify/ProductVariant/32680539160707",  // Prep Shampoo 33.8 oz
      "gid://shopify/ProductVariant/32680536965251",  // Express Remover 8.5 fl oz
      "gid://shopify/ProductVariant/32680536375427",  // Glide Remover 8.5 fl oz
      "gid://shopify/ProductVariant/46845730423012",  // Tape In Weft Roll
      "gid://shopify/ProductVariant/46845764731108"   // Tape In Weft Single Side Strip
    ]
  },
  // Tape In System Product
  "tape-in": {
    name: "Tape In",  // This name is used to detect products in cart
    tools: [
      "gid://shopify/ProductVariant/40114872385685",  // EZ Re-Tape Tabs
      "gid://shopify/ProductVariant/32680537915523",  // Re-Tape Tabs
      "gid://shopify/ProductVariant/32680538603651",  // Single-Sided Tape Tabs
      "gid://shopify/ProductVariant/32680542994563",  // Tape In Pliers
      "gid://shopify/ProductVariant/32680536375427",  // Glide Remover 8.5 fl oz
      "gid://shopify/ProductVariant/32680536965251",  // Express Remover 8.5 fl oz
      "gid://shopify/ProductVariant/32680546533507",  // Tail Comb
      "gid://shopify/ProductVariant/32680547876995",  // Hair Grippers (2/pk)
      "gid://shopify/ProductVariant/46308159979748"   // Clips - 4 pcs/pack
    ]
  },
  // Keratin Fusion System Product
  "keratin-fusion": {
    name: "Keratin Fusion",  // This name is used to detect products in cart
    tools: [
      "gid://shopify/ProductVariant/32680540176515",  // Fusion Gun
      "gid://shopify/ProductVariant/32680540373123",  // Fusion Discs
      "gid://shopify/ProductVariant/32680544108675",  // Bond Cutting Pliers
      "gid://shopify/ProductVariant/32680540307587",  // Bond Breaking Pliers
      "gid://shopify/ProductVariant/32680546533507",  // Tail Comb
      "gid://shopify/ProductVariant/32680547876995",  // Hair Grippers (2/pk)
      "gid://shopify/ProductVariant/46308159979748"   // Clips - 4 pcs/pack
    ]
  },
  // Cylinder System Product
  "cylinder": {
    name: "Cylinder",  // This name is used to detect products in cart
    tools: [
      "gid://shopify/ProductVariant/32680546533507",  // Tail Comb
      "gid://shopify/ProductVariant/32680539193475",  // Copper Cylinders
      "gid://shopify/ProductVariant/32680539390083",  // Silicone Beads - 150 pcs
      "gid://shopify/ProductVariant/32680539783299",  // Deluxe Pliers
      "gid://shopify/ProductVariant/32680544108675",  // Bond Cutting Pliers
      "gid://shopify/ProductVariant/32680540307587",  // Bond Breaking Pliers
      "gid://shopify/ProductVariant/32680547876995",  // Hair Grippers (2/pk)
      "gid://shopify/ProductVariant/46308159979748"   // Clips - 4 pcs/pack
    ]
  }
};

// Common tools to show when 2+ system products are in cart OR when no system products (variant IDs)
const COMMON_TOOLS = [
  "gid://shopify/ProductVariant/46308159979748",  // Clips - 4 pcs/pack
  "gid://shopify/ProductVariant/32680547876995",  // Hair Grippers (2/pk)
  "gid://shopify/ProductVariant/32680546533507",  // Tail Comb
  "gid://shopify/ProductVariant/42072169939172",  // Nylon Thread
  "gid://shopify/ProductVariant/32680540340355",  // Loop Tool
  "gid://shopify/ProductVariant/42072185045220"   // Small Scissors
];

// Default tools to show when no system products are in cart (6 tools)
const DEFAULT_TOOLS = COMMON_TOOLS;

// Tools Database - All tool products with their details
// Key = Variant ID, Value = Product details
const TOOLS_DATABASE = {
  "gid://shopify/ProductVariant/32680546533507": {
    title: "Tail Comb",
    price: "$1.50",
    image: "https://cdn.shopify.com/s/files/1/0359/3597/7603/products/Rat-Tail-Comb.jpg?v=1584462962"
  },
  "gid://shopify/ProductVariant/32680539390083": {
    title: "Silicone Beads - 150 pcs",
    price: "$12.00",
    image: "https://cdn.shopify.com/s/files/1/0359/3597/7603/products/Silicone-Beads-1.jpg?v=1584462786"
  },
  "gid://shopify/ProductVariant/32680540340355": {
    title: "Loop Tool",
    price: "$20.00",
    image: "https://cdn.shopify.com/s/files/1/0359/3597/7603/products/Loop-Tool.jpg?v=1584462787"
  },
  "gid://shopify/ProductVariant/32680539783299": {
    title: "Deluxe Pliers",
    price: "$65.00",
    image: "https://cdn.shopify.com/s/files/1/0359/3597/7603/products/Deluxe-Pliers.png?v=1584462720"
  },
  "gid://shopify/ProductVariant/42072169939172": {
    title: "Nylon Thread",
    price: "$9.00",
    image: "https://cdn.shopify.com/s/files/1/0359/3597/7603/files/Nylon-Thread-Black0167-Edit.jpg?v=1757439384"
  },
  "gid://shopify/ProductVariant/42072185045220": {
    title: "Small Scissors",
    price: "$6.00",
    image: "https://cdn.shopify.com/s/files/1/0359/3597/7603/files/Small-Scissors-2.jpg?v=1757436559"
  },
  "gid://shopify/ProductVariant/32680545255555": {
    title: "Thread",
    price: "$4.00",
    image: "https://cdn.shopify.com/s/files/1/0359/3597/7603/files/Thread-Blonde0222-Edit.jpg?v=1757439774"
  },
  "gid://shopify/ProductVariant/46308159979748": {
    title: "Clips - 4 pcs/pack",
    price: "$6.00",
    image: "https://cdn.shopify.com/s/files/1/0359/3597/7603/files/AQUAClips0158-Edit-Edit.jpg?v=1746820657"
  },
  "gid://shopify/ProductVariant/32680547876995": {
    title: "Hair Grippers (2/pk)",
    price: "$5.00",
    image: "https://cdn.shopify.com/s/files/1/0359/3597/7603/products/Aqua-Hair-Extensions-Hair-Gripper.jpg?v=1584462967"
  },
  "gid://shopify/ProductVariant/32680535523459": {
    title: "Boar Bristle Brush",
    price: "$15.00",
    image: "https://cdn.shopify.com/s/files/1/0359/3597/7603/files/White_Bristle_Brush_1x1_7e57be3c-a30b-4c29-8010-91b61304ebb7.jpg?v=1757426467"
  },
  "gid://shopify/ProductVariant/32680545190019": {
    title: "Weft Needles - 2 pcs/pack",
    price: "$2.00",
    image: "https://cdn.shopify.com/s/files/1/0359/3597/7603/products/Needles.jpg?v=1584462984"
  },
  "gid://shopify/ProductVariant/32680539160707": {
    title: "Prep Shampoo 33.8 oz",
    price: "$23.00",
    image: "https://cdn.shopify.com/s/files/1/0359/3597/7603/files/Wetline-Prep-Treatment-1x1_a11c347f-9f42-46c7-916d-1ffbef1d9893.jpg?v=1753366941"
  },
  "gid://shopify/ProductVariant/32680536965251": {
    title: "Express Remover 8.5 fl oz",
    price: "$16.00",
    image: "https://cdn.shopify.com/s/files/1/0359/3597/7603/files/Wetline-Express-Remover-1x1_617f52fc-cc8e-4286-a803-2f463b2d70de.jpg?v=1753366834"
  },
  "gid://shopify/ProductVariant/32680536375427": {
    title: "Glide Remover 8.5 fl oz",
    price: "$16.00",
    image: "https://cdn.shopify.com/s/files/1/0359/3597/7603/files/Wetline-Glide-Remover-1x1_2893d00d-93c0-4705-b395-773064b9687c.jpg?v=1753366876"
  },
  "gid://shopify/ProductVariant/46845730423012": {
    title: "Tape In Weft Roll",
    price: "$20.00",
    image: "https://cdn.shopify.com/s/files/1/0359/3597/7603/files/IMG_1457-Edit-3.jpg?v=1760569429"
  },
  "gid://shopify/ProductVariant/46845764731108": {
    title: "Tape In Weft Single Side Strip",
    price: "$18.00",
    image: "https://cdn.shopify.com/s/files/1/0359/3597/7603/files/IMG_1466-Edit.jpg?v=1760614274"
  },
  "gid://shopify/ProductVariant/40114872385685": {
    title: "EZ Re-Tape Tabs",
    price: "$12.00",
    image: "https://cdn.shopify.com/s/files/1/0359/3597/7603/files/EZ-Re-Tape-Tabs-_2025.jpg?v=1757436747"
  },
  "gid://shopify/ProductVariant/32680537915523": {
    title: "Re-Tape Tabs",
    price: "$12.00",
    image: "https://cdn.shopify.com/s/files/1/0359/3597/7603/files/Retape-Tabs-1x1.jpg?v=1754345590"
  },
  "gid://shopify/ProductVariant/32680538603651": {
    title: "Single-Sided Tape Tabs",
    price: "$11.00",
    image: "https://cdn.shopify.com/s/files/1/0359/3597/7603/files/Single-Side-Tape-Tabs-1x1.jpg?v=1754333613"
  },
  "gid://shopify/ProductVariant/32680542994563": {
    title: "Tape In Pliers",
    price: "$50.00",
    image: "https://cdn.shopify.com/s/files/1/0359/3597/7603/products/Tape-In-Pliers.jpg?v=1584462952"
  },
  "gid://shopify/ProductVariant/32680540176515": {
    title: "Fusion Gun",
    price: "$150.00",
    image: "https://cdn.shopify.com/s/files/1/0359/3597/7603/products/Fusion-Gun_56101a2c-8185-41ab-8d63-3da7e1d76400.jpg?v=1584462756"
  },
  "gid://shopify/ProductVariant/32680540373123": {
    title: "Fusion Discs",
    price: "$5.00",
    image: "https://cdn.shopify.com/s/files/1/0359/3597/7603/products/Fusion-Discs.jpg?v=1584462760"
  },
  "gid://shopify/ProductVariant/32680544108675": {
    title: "Bond Cutting Pliers",
    price: "$50.00",
    image: "https://cdn.shopify.com/s/files/1/0359/3597/7603/products/Bond-Cutting-Pliers.jpg?v=1584462954"
  },
  "gid://shopify/ProductVariant/32680540307587": {
    title: "Bond Breaking Pliers",
    price: "$50.00",
    image: "https://cdn.shopify.com/s/files/1/0359/3597/7603/products/Bond-Breaking-Fusion-Pliers-2022_3.png?v=1656083800"
  },
  "gid://shopify/ProductVariant/32680539193475": {
    title: "Copper Cylinders",
    price: "$12.00",
    image: "https://cdn.shopify.com/s/files/1/0359/3597/7603/files/Copper-Cylinder-Dark-Brown0218-Edit.jpg?v=1757460081"
  }
};

// ============================================================
// END CONFIGURATION SECTION
// ============================================================

// 1. Choose an extension target - renders after discount code field
export default reactExtension("purchase.checkout.reductions.render-after", () => (
  <Extension />
));

function Extension() {
  const { extension } = useApi();
  const instructions = useInstructions();
  const applyCartLinesChange = useApplyCartLinesChange();
  const cartLines = useCartLines();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [loading, setLoading] = useState(null);

  // 2. Detect system products and determine which tools to show
  const upsellTools = useMemo(() => {
    if (!cartLines || cartLines.length === 0) {
      // Cart is empty - show 6 default tools
      console.log("Cart is empty, showing default tools");
      return DEFAULT_TOOLS.slice(0, 6).map(toolVariantId => {
        const toolData = TOOLS_DATABASE[toolVariantId];
        if (toolData) {
          return {
            id: toolVariantId,
            title: toolData.title,
            price: toolData.price,
            image: toolData.image
          };
        }
        return null;
      }).filter(tool => tool !== null);
    }

    // Get all product titles and variant IDs in the cart
    const cartItems = cartLines.map(line => ({
      title: line.merchandise.title.toLowerCase(),
      variantId: line.merchandise.id
    }));
    
    console.log("Cart items:", cartItems);

    // Find system products in cart by matching product titles (case-insensitive)
    const systemProductsInCart = Object.entries(SYSTEM_PRODUCTS_MAP).filter(([variantId, config]) => {
      const systemName = config.name.toLowerCase();
      // Check if any cart item title contains the system product name
      return cartItems.some(item => item.title.includes(systemName));
    });

    console.log("System products found:", systemProductsInCart.map(([id, config]) => config.name));

    let toolsToRecommend = [];

    if (systemProductsInCart.length === 0) {
      // No system products in cart - show 6 default tools
      console.log("No system products found, showing default tools");
      toolsToRecommend = DEFAULT_TOOLS;
    } else if (systemProductsInCart.length === 1) {
      // Only 1 system product - show all its related tools
      toolsToRecommend = systemProductsInCart[0][1].tools || [];
    } else {
      // 2+ system products - show common tools
      toolsToRecommend = COMMON_TOOLS;
    }

    console.log("Tools to recommend (before filtering):", toolsToRecommend);

    // Filter out tools already in the cart by checking variant IDs
    const cartVariantIds = cartItems.map(item => item.variantId);
    const filteredTools = toolsToRecommend.filter(toolVariantId => {
      return !cartVariantIds.includes(toolVariantId);
    });

    console.log("Filtered tools (after removing existing):", filteredTools);

    // Limit to 6 tools and convert to product objects
    const toolProducts = filteredTools
      .slice(0, 6)
      .map(toolVariantId => {
        const toolData = TOOLS_DATABASE[toolVariantId];
        if (toolData) {
          return {
            id: toolVariantId,
            title: toolData.title,
            price: toolData.price,
            image: toolData.image
          };
        }
        return null;
      })
      .filter(tool => tool !== null); // Remove any undefined tools

    console.log("Final tool products:", toolProducts);

    return toolProducts;
  }, [cartLines]);

  // Check instructions for feature availability
  console.log("Instructions check:", {
    cartLines: instructions.cartLines,
    canAddCartLine: instructions.cartLines?.canAddCartLine,
    upsellToolsLength: upsellTools.length
  });

  // If no tools to recommend, don't show anything
  if (upsellTools.length === 0) {
    console.log("No upsell tools to display");
    return null;
  }

  // Check if we can add cart lines (but don't block rendering)
  if (!instructions.cartLines?.canAddCartLine) {
    console.warn("Cannot add cart lines - buttons will be disabled");
  }

  // Split tools into slides of 3 products each
  const productSlides = [];
  for (let i = 0; i < upsellTools.length; i += 3) {
    productSlides.push(upsellTools.slice(i, i + 3));
  }

  // Navigation handlers
  const handlePrevious = () => {
    setCurrentSlide((prev) => 
      prev === 0 ? productSlides.length - 1 : prev - 1
    );
  };

  const handleNext = () => {
    setCurrentSlide((prev) => 
      prev === productSlides.length - 1 ? 0 : prev + 1
    );
  };

  // Add product to cart
  const handleAddToOrder = async (product) => {
    console.log('Add to order clicked for:', product);
    setLoading(product.id);
    try {
      const result = await applyCartLinesChange({
        type: 'addCartLine',
        merchandiseId: product.id,
        quantity: 1,
      });
      
      console.log('applyCartLinesChange result:', result);
      
      if (result.type === 'error') {
        console.error('Error adding product:', result.message);
      } else {
        console.log('✅ Product added successfully:', product.title);
      }
    } catch (error) {
      console.error('❌ Error adding product to cart:', error);
    } finally {
      setLoading(null);
    }
  };

  const currentProducts = productSlides[currentSlide];

  console.log("About to render slider:", {
    productSlides: productSlides.length,
    currentSlide,
    currentProducts: currentProducts?.length
  });

  // 3. Render the upsell slider UI
  return (
    <BlockStack spacing="base" padding="base">
      {/* Header with navigation */}
      <InlineStack spacing="base" blockAlignment="center">
        <Heading level={2}>You might like</Heading>
        {productSlides.length > 1 && (
          <InlineStack spacing="tight">
            <Button
              kind="secondary"
              onPress={handlePrevious}
              accessibilityLabel="Previous products"
            >
              <Text size="extraLarge">‹</Text>
            </Button>
            <Button
              kind="secondary"
              onPress={handleNext}
              accessibilityLabel="Next products"
            >
              <Text size="extraLarge">›</Text>
            </Button>
          </InlineStack>
        )}
      </InlineStack>

      <Divider />

      {/* Products stack - 3 products vertically */}
      <BlockStack spacing="base">
        {currentProducts.map((product) => (
          <BlockStack
            key={product.id}
            spacing="base"
            padding="base"
            border="base"
            cornerRadius="base"
          >
            {/* Product Image and Details - Horizontal Layout */}
            <InlineStack spacing="base" blockAlignment="center">
              {/* Small Product Image */}
              <View maxInlineSize={80} maxBlockSize={80} minInlineSize={80} minBlockSize={80}>
                <Image
                  source={product.image}
                  alt={product.title}
                  aspectRatio={1}
                  border="base"
                  cornerRadius="base"
                />
              </View>
              
              {/* Product Title and Price stacked vertically */}
              <BlockStack spacing="tight">
                <Text size="base" emphasis="bold">
                  {product.title}
                </Text>
                <Text size="base">{product.price}</Text>
              </BlockStack>
            </InlineStack>

            {/* Add to Order Button - Full Width */}
            <Button
              kind="secondary"
              onPress={() => handleAddToOrder(product)}
              loading={loading === product.id}
              disabled={loading !== null}
            >
              Add to order
            </Button>
          </BlockStack>
        ))}
      </BlockStack>

      {/* Slide indicator - only show if more than 1 slide */}
      {productSlides.length > 1 && (
        <InlineStack spacing="tight" inlineAlignment="center">
          {productSlides.map((_, index) => (
            <Text
              key={index}
              size="small"
              appearance={index === currentSlide ? "accent" : "subdued"}
            >
              •
            </Text>
          ))}
        </InlineStack>
      )}
    </BlockStack>
  );
}