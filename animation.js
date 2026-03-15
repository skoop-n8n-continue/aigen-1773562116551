// ====================================================
// QUALITY ROOTS - THE BOTANICAL GALLERY
// DESIGN DECISION: 1 Product Per Cycle for max impact
// ====================================================
const PRODUCTS_PER_CYCLE = 1;

let PRODUCTS = [];

// Register GSAP plugins
gsap.registerPlugin(SplitText, CustomEase);

// Custom Eases for that high-end feel
CustomEase.create("snappy", "M0,0 C0.1,0.8 0.1,1 1,1");
CustomEase.create("smoothOut", "M0,0 C0.5,0 0.2,1 1,1");

async function loadProducts() {
  try {
    const response = await fetch('./products.json');
    if (!response.ok) throw new Error('Network response was not ok');
    const data = await response.json();
    PRODUCTS = data.products || [];
  } catch (error) {
    console.error('Failed to load products.json, falling back to empty array.', error);
    PRODUCTS = [];
  }

  if (PRODUCTS.length > 0) {
    startCycle();
  } else {
    console.warn("No products found to animate.");
  }
}

function getBatch(batchIndex) {
  const start = (batchIndex * PRODUCTS_PER_CYCLE) % Math.max(PRODUCTS.length, 1);
  const batch = [];
  for (let i = 0; i < PRODUCTS_PER_CYCLE; i++) {
    if (PRODUCTS.length > 0) {
      batch.push(PRODUCTS[(start + i) % PRODUCTS.length]);
    }
  }
  return batch;
}

function renderBatch(products) {
  const container = document.getElementById('products-container');
  container.innerHTML = ''; // Clear previous

  products.forEach((product, index) => {
    const originalPrice = parseFloat(product.price);
    const discountPrice = parseFloat(product.discounted_price);

    let priceHTML = '';
    let dealText = 'ONLY';

    if (!isNaN(discountPrice) && discountPrice > 0 && discountPrice < originalPrice) {
       dealText = 'SALE';
       priceHTML = `
          <div class="main-price-wrapper">
             <span class="main-price">$${discountPrice % 1 === 0 ? discountPrice : discountPrice.toFixed(2)}</span>
             <span class="price-strike">$${originalPrice}</span>
          </div>
       `;
    } else {
       priceHTML = `
          <div class="main-price-wrapper">
             <span class="main-price">$${originalPrice}</span>
          </div>
       `;
    }

    const weightTag = product.unit_weight ? `<span class="tag">${product.unit_weight}${product.unit_weight_unit}</span>` : '';
    const strainTag = product.strain ? `<span class="tag">${product.strain}</span>` : '';

    const productEl = document.createElement('div');
    productEl.className = 'product-scene';

    productEl.innerHTML = `
      <div class="card-container">
        <div class="card-left">
           <div class="brand-badge">${product.brand || 'PREMIUM'}</div>
           <div class="price-section">
              <div class="deal-text">${dealText}</div>
              ${priceHTML}
           </div>
           <div class="product-name" id="product-name-text">${product.name}</div>
           <div class="tags">
              ${strainTag}
              ${weightTag}
           </div>
        </div>
        <div class="card-right">
           <div class="stamp-bg"></div>
           <img src="${product.image_url}" class="product-img" alt="product">
        </div>
        <div class="madness-bar"></div>
      </div>
    `;

    container.appendChild(productEl);
  });
}

function animateCycle(batchIndex) {
  const batch = getBatch(batchIndex);
  renderBatch(batch);

  // Grab elements for animation
  const card = document.querySelector('.card-container');
  const badge = document.querySelector('.brand-badge');
  const dealText = document.querySelector('.deal-text');
  const mainPrice = document.querySelector('.main-price');
  const priceStrike = document.querySelector('.price-strike');
  const nameElement = document.getElementById('product-name-text');
  const tags = document.querySelectorAll('.tag');
  const rightSide = document.querySelector('.card-right');
  const productImg = document.querySelector('.product-img');
  const stampBg = document.querySelector('.stamp-bg');
  const madnessBar = document.querySelector('.madness-bar');
  const bgBrackets = document.querySelectorAll('.bg-bracket');
  const background = document.getElementById('background');

  // SplitText for product name
  const splitName = new SplitText(nameElement, { type: "words,chars" });

  // Reset / Set Initial States
  gsap.set(card, { y: 150, opacity: 0, rotationX: 10, transformPerspective: 1000 });
  gsap.set(rightSide, { clipPath: "polygon(100% 0, 100% 0, 100% 100%, 100% 100%)" });
  gsap.set(badge, { x: -50, opacity: 0 });
  gsap.set(dealText, { y: 30, opacity: 0 });
  gsap.set(mainPrice, { scale: 0.5, opacity: 0, transformOrigin: "left bottom" });
  if (priceStrike) gsap.set(priceStrike, { scale: 0, opacity: 0, rotation: -10 });
  gsap.set(splitName.chars, { y: 50, opacity: 0 });
  gsap.set(tags, { y: 20, opacity: 0 });
  gsap.set(productImg, { x: 300, rotation: 15, opacity: 0, scale: 0.8 });
  gsap.set(stampBg, { rotation: -15, scale: 0.5, opacity: 0 });
  gsap.set(madnessBar, { scaleX: 0, transformOrigin: "left center" });

  const tl = gsap.timeline({
    onComplete: () => {
       // Cleanup SplitText to avoid memory leaks
       splitName.revert();
       animateCycle(batchIndex + 1); // loop to next
    }
  });

  // --- PHASE 1: ENTRANCE ---

  // Parallax the main background slightly
  tl.to(background, {
      x: "-=30",
      y: "+=15",
      duration: 8,
      ease: "sine.inOut",
      yoyo: true,
      repeat: 1
  }, 0);

  tl.to(card, {
    y: 0,
    opacity: 1,
    rotationX: 0,
    duration: 1.2,
    ease: "expo.out"
  }, 0.2);

  tl.to(madnessBar, {
    scaleX: 1,
    duration: 1,
    ease: "expo.inOut"
  }, 0.5);

  tl.to(rightSide, {
    clipPath: "polygon(15% 0, 100% 0, 100% 100%, 0% 100%)",
    duration: 1.2,
    ease: "expo.inOut"
  }, 0.6);

  tl.to(stampBg, {
    rotation: 0,
    scale: 1,
    opacity: 0.15,
    duration: 1.5,
    ease: "back.out(1.2)"
  }, 1.0);

  tl.to(productImg, {
    x: 0,
    rotation: 0,
    opacity: 1,
    scale: 1,
    duration: 1.5,
    ease: "back.out(1.5)"
  }, 1.2);

  // Typography choreography
  tl.to(badge, {
    x: 0,
    opacity: 1,
    duration: 0.8,
    ease: "back.out(1.5)"
  }, 1.0);

  tl.to(dealText, {
    y: 0,
    opacity: 1,
    duration: 0.6,
    ease: "smoothOut"
  }, 1.2);

  tl.to(mainPrice, {
    scale: 1,
    opacity: 1,
    duration: 0.8,
    ease: "back.out(2)" // High impact pop
  }, 1.4);

  if (priceStrike) {
    tl.to(priceStrike, {
      scale: 1,
      opacity: 1,
      rotation: 0,
      duration: 0.6,
      ease: "back.out(1.5)"
    }, 1.6);
  }

  tl.to(splitName.chars, {
    y: 0,
    opacity: 1,
    ease: "back.out(2)",
    stagger: 0.02
  }, 1.6);

  tl.to(tags, {
    y: 0,
    opacity: 1,
    ease: "back.out(1.5)",
    stagger: 0.1
  }, 2.0);

  // Background brackets float in
  tl.to(bgBrackets, {
      y: -20,
      opacity: 0.2,
      duration: 2,
      ease: "sine.out",
      stagger: 0.2
  }, 0);


  // --- PHASE 2: LIVING MOMENT (Idle) ---
  // The product breathes
  tl.to(productImg, {
    y: -20,
    rotation: 2,
    duration: 3,
    ease: "sine.inOut",
    yoyo: true,
    repeat: 1
  }, 2.0);

  // Stamp rotates slowly
  tl.to(stampBg, {
    rotation: 5,
    scale: 1.05,
    duration: 6,
    ease: "none"
  }, 2.0);


  // --- PHASE 3: EXIT ---
  const exitTime = 7.5; // Start exit at 7.5s, making total cycle ~9s

  tl.to(productImg, {
    x: -100,
    opacity: 0,
    scale: 0.8,
    rotation: -10,
    duration: 0.8,
    ease: "power2.in"
  }, exitTime);

  tl.to([badge, dealText, mainPrice, priceStrike, splitName.chars, tags], {
    x: -50,
    opacity: 0,
    duration: 0.5,
    stagger: 0.02,
    ease: "power2.in"
  }, exitTime + 0.2);

  tl.to(rightSide, {
    clipPath: "polygon(100% 0, 100% 0, 100% 100%, 100% 100%)",
    duration: 0.8,
    ease: "expo.in"
  }, exitTime + 0.4);

  tl.to(card, {
    y: -150,
    opacity: 0,
    rotationX: -10,
    duration: 0.8,
    ease: "expo.in"
  }, exitTime + 0.6);

}

// Start sequence when DOM is ready
window.addEventListener('DOMContentLoaded', loadProducts);