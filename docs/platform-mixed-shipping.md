# Platform mixed-vendor shipping

I cannot write into your Windows folder from this chat.
Pull this branch into the local MarvelMarts repo:

```bat
cd C:\Users\MarvelCMedia\documents\marvelmarts
git fetch origin
git checkout feature/platform-mixed-shipping
```

If that folder is not a git clone of tsbproject/marvelmarts, clone first:

```bat
git clone -b feature/platform-mixed-shipping https://github.com/tsbproject/marvelmarts.git
```

## What landed
- Mixed carts use platform Standard / Express / Store pickup
- Product.shippingMethod is ignored on mixed carts
- One platform shipping fee, kept by MarvelMarts
- Vendor payout uses order.subtotal only
- Cart items store vendorProfileId so checkout can detect mixed carts
