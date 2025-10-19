(function initVisitorCounter() {
  const counterElements = () => document.querySelectorAll('#countValue');
  const updateElements = (value) => {
    counterElements().forEach(el => {
      el.textContent = value;
    });
  };

  const formatValue = (value) => {
    try {
      return Number(value).toLocaleString();
    } catch (error) {
      return value;
    }
  };

  fetch('https://api.countapi.xyz/hit/prepify11plus/visitors')
    .then(res => res.json())
    .then(data => {
      if (typeof data?.value !== 'number') throw new Error('Invalid response');
      updateElements(formatValue(data.value));
    })
    .catch(() => {
      updateElements('40,000+');
    });
})();
