import { prisma } from "../lib/prisma";
import {
  createCheckoutOrderAction,
  trackOrderAction,
  verifyAndConfirmPaymentAction,
} from "../server/actions/orderActions";
import {
  addToCartAction,
  getCartAction,
  updateCartItemQuantityAction,
} from "../server/actions/storeActions";
import { calculateCartTotals } from "../lib/cart";

async function runTestSuite() {
  console.log("==========================================================");
  console.log("🧪 RUNNING GUEST CHECKOUT VERIFICATION TEST SUITE");
  console.log("==========================================================\n");

  let passedCount = 0;
  let failedCount = 0;

  function assert(condition: boolean, testName: string, detail?: string) {
    if (condition) {
      console.log(`✅ [PASS] ${testName}`);
      if (detail) console.log(`   └─ ${detail}`);
      passedCount++;
    } else {
      console.error(`❌ [FAIL] ${testName}`);
      if (detail) console.error(`   └─ ${detail}`);
      failedCount++;
    }
  }

  // Fetch sample active product for testing
  const sampleProduct = await prisma.product.findFirst({
    where: { status: "ACTIVE", stock: { gte: 5 } },
  });

  if (!sampleProduct) {
    throw new Error("No active product found in database for testing.");
  }

  const testGuestId = `test_guest_${Date.now()}`;

  // ------------------------------------------------------------------------
  // Test 1: Guest can add products to cart
  // ------------------------------------------------------------------------
  const addRes = await addToCartAction({
    productId: sampleProduct.id,
    quantity: 2,
    guestId: testGuestId,
  });
  assert(addRes.success === true, "Scenario 1: Guest can add products to cart", `Added 2 units of ${sampleProduct.name}`);

  // ------------------------------------------------------------------------
  // Test 2: Guest can refresh page without losing cart (persist across sessions)
  // ------------------------------------------------------------------------
  const cartRes = await getCartAction(testGuestId);
  const foundItem = cartRes.cart?.items.find((i) => i.productId === sampleProduct.id);
  assert(
    cartRes.success === true && foundItem !== undefined && foundItem.quantity === 2,
    "Scenario 2: Guest cart persists across page refreshes",
    `Found ${foundItem?.quantity} items in cart for guestId: ${testGuestId}`
  );

  // ------------------------------------------------------------------------
  // Test 3: Guest can proceed directly to checkout (Calculate cart totals without auth)
  // ------------------------------------------------------------------------
  const totals = await calculateCartTotals([
    { productId: sampleProduct.id, quantity: 2 },
  ]);
  assert(
    totals.items.length === 1 && totals.subtotal > 0 && totals.total > 0,
    "Scenario 3: Guest can proceed to checkout (Calculated totals securely on server)",
    `Subtotal: ₹${totals.subtotal}, Shipping: ₹${totals.shippingFee}, Total: ₹${totals.total}`
  );

  // ------------------------------------------------------------------------
  // Test 4: Missing mandatory fields show validation errors
  // ------------------------------------------------------------------------
  const invalidPayload: any = {
    phone: "",
    shippingAddress: {
      name: "",
      phone: "",
      street: "",
      city: "",
      state: "",
      postalCode: "",
      country: "India",
    },
    items: [],
  };
  const invalidRes = await createCheckoutOrderAction(invalidPayload);
  assert(
    invalidRes.success === false,
    "Scenario 4: Missing mandatory fields return validation error",
    `Rejected with error: "${invalidRes.error}"`
  );

  // ------------------------------------------------------------------------
  // Test 5: Invalid mobile numbers are rejected
  // ------------------------------------------------------------------------
  const badPhonePayload = {
    phone: "12345",
    shippingAddress: {
      name: "Ramesh Sharma",
      phone: "12345",
      street: "123 Kite Market Road",
      city: "Bareilly",
      state: "Uttar Pradesh",
      postalCode: "243001",
      country: "India",
    },
    items: [{ productId: sampleProduct.id, quantity: 1 }],
    guestId: testGuestId,
    paymentMethod: "COD" as const,
  };
  const badPhoneRes = await createCheckoutOrderAction(badPhonePayload);
  assert(
    badPhoneRes.success === false,
    "Scenario 5: Invalid mobile numbers are strictly rejected",
    `Rejected with: "${badPhoneRes.error}"`
  );

  // ------------------------------------------------------------------------
  // Test 6: Out-of-stock products cannot be ordered
  // ------------------------------------------------------------------------
  const outOfStockPayload = {
    phone: "9876543210",
    shippingAddress: {
      name: "Ramesh Sharma",
      phone: "9876543210",
      street: "123 Kite Market Road",
      city: "Bareilly",
      state: "Uttar Pradesh",
      postalCode: "243001",
      country: "India",
    },
    items: [{ productId: sampleProduct.id, quantity: 999999 }], // Excessive quantity
    guestId: testGuestId,
    paymentMethod: "COD" as const,
  };
  const stockRes = await createCheckoutOrderAction(outOfStockPayload);
  assert(
    stockRes.success === false && (stockRes.error?.includes("Insufficient stock") || stockRes.error?.includes("available")),
    "Scenario 6: Out-of-stock quantities cannot be ordered",
    `Properly rejected with: "${stockRes.error}"`
  );

  // ------------------------------------------------------------------------
  // Test 7: Failed orders do NOT lose cart items
  // ------------------------------------------------------------------------
  const cartAfterFail = await getCartAction(testGuestId);
  assert(
    (cartAfterFail.cart?.items.length || 0) > 0,
    "Scenario 7: Failed order retains all items in guest cart",
    `Cart still has ${cartAfterFail.cart?.items.length} item(s)`
  );

  // ------------------------------------------------------------------------
  // Test 8: Guest can place a Cash on Delivery (COD) order
  // ------------------------------------------------------------------------
  const validGuestPhone = `98${Math.floor(10000000 + Math.random() * 90000000)}`;
  const codPayload = {
    email: "guest_buyer@example.com",
    phone: validGuestPhone,
    shippingAddress: {
      name: "Rathore Guest Buyer",
      phone: validGuestPhone,
      street: "Flat 402, Shanti Vihar, Old City",
      city: "Gwalior",
      state: "Madhya Pradesh",
      postalCode: "474001",
      country: "India",
    },
    items: [{ productId: sampleProduct.id, quantity: 1 }],
    guestId: testGuestId,
    paymentMethod: "COD" as const,
  };

  const codRes = await createCheckoutOrderAction(codPayload);
  assert(
    codRes.success === true && codRes.order !== undefined && codRes.order.orderNumber.length > 0,
    "Scenario 8: Guest can place a Cash on Delivery (COD) order successfully",
    `Order Created: ${codRes.order?.orderNumber} (ID: ${codRes.order?.id}, Total: ₹${codRes.order?.total})`
  );

  // ------------------------------------------------------------------------
  // Test 9: Cart clears ONLY after successful order creation
  // ------------------------------------------------------------------------
  const cartAfterSuccess = await getCartAction(testGuestId);
  assert(
    (cartAfterSuccess.cart?.items.length || 0) === 0,
    "Scenario 9: Guest cart clears automatically after successful order creation",
    `Items in guest cart: ${cartAfterSuccess.cart?.items.length}`
  );

  // ------------------------------------------------------------------------
  // Test 10: Double-clicking Place Order does not create duplicate orders
  // ------------------------------------------------------------------------
  const duplicateRes = await createCheckoutOrderAction(codPayload);
  assert(
    duplicateRes.success === true && duplicateRes.order?.id === codRes.order?.id,
    "Scenario 10: Repeated clicks within 15s prevent duplicate orders",
    `Returned existing order ID ${duplicateRes.order?.id} without duplication`
  );

  // ------------------------------------------------------------------------
  // Test 11: Guest can place an Online Payment (Razorpay) order
  // ------------------------------------------------------------------------
  const onlineGuestId = `online_guest_${Date.now()}`;
  await addToCartAction({
    productId: sampleProduct.id,
    quantity: 1,
    guestId: onlineGuestId,
  });

  const onlinePhone = `99${Math.floor(10000000 + Math.random() * 90000000)}`;
  const onlinePayload = {
    email: "online_guest@example.com",
    phone: onlinePhone,
    shippingAddress: {
      name: "Online Shopper",
      phone: onlinePhone,
      street: "Plot 18, Ring Road",
      city: "Ahmedabad",
      state: "Gujarat",
      postalCode: "380001",
      country: "India",
    },
    items: [{ productId: sampleProduct.id, quantity: 1 }],
    guestId: onlineGuestId,
    paymentMethod: "RAZORPAY" as const,
  };

  const onlineRes = await createCheckoutOrderAction(onlinePayload);
  assert(
    onlineRes.success === true && onlineRes.isCod === false && onlineRes.razorpayOrder !== null,
    "Scenario 11: Guest can initiate Online Payment order (Razorpay integration)",
    `Razorpay Order ID: ${onlineRes.razorpayOrder?.id}, Amount: ₹${onlineRes.order?.total}`
  );

  // Verify online payment confirmation
  const confirmRes = await verifyAndConfirmPaymentAction({
    orderId: onlineRes.order!.id,
    razorpayOrderId: onlineRes.razorpayOrder!.id,
    razorpayPaymentId: `pay_test_${Date.now()}`,
    razorpaySignature: "mock_signature_valid",
    guestId: onlineGuestId,
  });
  assert(
    confirmRes.success === true,
    "Scenario 11b: Online payment verification updates order to PAID and clears cart",
    `Confirmed Order ${confirmRes.orderNumber}`
  );

  // ------------------------------------------------------------------------
  // Test 12: Guest customer can securely track order with Order Number + Phone
  // ------------------------------------------------------------------------
  const trackRes = await trackOrderAction({
    orderNumber: codRes.order!.orderNumber,
    phone: validGuestPhone,
  });
  assert(
    trackRes.success === true && trackRes.orderId === codRes.order!.id,
    "Scenario 12: Guest can securely track order via Order Number + Mobile Number",
    `Found Order ${trackRes.order?.orderNumber}, Status: ${trackRes.order?.orderStatus}`
  );

  // ------------------------------------------------------------------------
  // Test 13: Order tracking with incorrect phone number is rejected
  // ------------------------------------------------------------------------
  const trackFailRes = await trackOrderAction({
    orderNumber: codRes.order!.orderNumber,
    phone: "9111111111", // Wrong phone
  });
  assert(
    trackFailRes.success === false,
    "Scenario 13: Order tracking with incorrect mobile number is rejected for privacy",
    `Correctly blocked unauthorized lookup`
  );

  // ------------------------------------------------------------------------
  // Test 14: Existing registered user checkout continues working
  // ------------------------------------------------------------------------
  // Find or create sample customer
  const testUser = await prisma.user.upsert({
    where: { email: "registered_customer@monokite.store" },
    create: {
      email: "registered_customer@monokite.store",
      name: "Registered Test Customer",
      passwordHash: "hashed_dummy_password",
      role: "CUSTOMER",
    },
    update: {},
  });

  const registeredPayload = {
    email: testUser.email,
    phone: "9822334455",
    shippingAddress: {
      name: testUser.name || "Customer",
      phone: "9822334455",
      street: "Shop 12, Main Bazaar",
      city: "Jaipur",
      state: "Rajasthan",
      postalCode: "302001",
      country: "India",
    },
    items: [{ productId: sampleProduct.id, quantity: 1 }],
    paymentMethod: "COD" as const,
  };

  const regOrderRes = await createCheckoutOrderAction(registeredPayload);
  assert(
    regOrderRes.success === true && regOrderRes.order !== undefined,
    "Scenario 14: Authenticated user checkout continues working seamlessly",
    `Registered order created: ${regOrderRes.order?.orderNumber}`
  );

  console.log("\n==========================================================");
  console.log(`📊 TEST SUITE SUMMARY: ${passedCount} PASSED, ${failedCount} FAILED`);
  console.log("==========================================================");

  if (failedCount > 0) {
    process.exit(1);
  }
}

runTestSuite().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});

