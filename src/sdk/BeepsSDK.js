class BeepsSDK {
  constructor() {
    this.listeners = {};
  }

  dispatch(eventName, payload) {
    console.log(`BeepsSDK: Dispatching event "${eventName}" with payload:`, payload);
    if (this.listeners[eventName]) {
      this.listeners[eventName].forEach(callback => callback(payload));
    }
  }

  observe(eventName, callback) {
    if (!this.listeners[eventName]) {
      this.listeners[eventName] = [];
    }
    this.listeners[eventName].push(callback);
    console.log(`BeepsSDK: Observer registered for event "${eventName}".`);
    
    return () => {
      this.listeners[eventName] = this.listeners[eventName].filter(cb => cb !== callback);
      console.log(`BeepsSDK: Observer unregistered for event "${eventName}".`);
    };
  }

  report(metricName, value, tags = {}) {
    console.log(`BeepsSDK: Reporting metric "${metricName}" with value "${value}" and tags:`, tags);
    // In a real scenario, this would send data to an analytics or logging service
  }
}

const beepsSDK = new BeepsSDK();
export default beepsSDK;
