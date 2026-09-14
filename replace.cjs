const fs = require('fs');
let code = fs.readFileSync('src/components/Configurator.tsx', 'utf8');

code = code.replace(
  /const handleNext = \(\) => \{[\s\S]*?navigate\('\/'\);\n    \}\n  \};/,
  `const handleNext = async () => {
    if (step === 1) setStep(2);
    else {
      let rx;
      if (rxType === 'manual') {
        rx = { type: 'manual', od, os, pd: Number(pd) };
      } else if (rxType === 'upload') {
        rx = { type: 'upload', file };
      } else {
        rx = { type: 'none' };
      }
      
      const chosenTreatments = treatments.filter(t => selectedTreatments.includes(t.id));
      const treatmentsPrice = chosenTreatments.reduce((sum, t) => sum + t.price, 0);
      
      const order = {
        frameId: frame.id,
        frameName: frame.name,
        prescription: rxType,
        treatments: chosenTreatments.map(t => t.name),
        totalAmount: frame.price + treatmentsPrice,
        status: 'pending',
        createdAt: serverTimestamp()
      };
      
      try {
        await addDoc(collection(db, 'orders'), order);
        alert('Order placed successfully!');
        navigate('/');
      } catch (err) {
        console.error('Error placing order', err);
        alert('Failed to place order');
      }
    }
  };`
);
code = code.replace(
  /{step === 1 \? 'Continue to Lenses' : 'Add to Cart'}/,
  "{step === 1 ? 'Continue to Lenses' : 'Place Order'}"
);
fs.writeFileSync('src/components/Configurator.tsx', code);
