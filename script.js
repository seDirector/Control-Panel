new Vue({
  el: '#app',
  data: {
    ipAddress: '',
    port: '',
    apiKey: '',
    servers: [],
    fields: ['id', 'game', 'name', 'port', 'currentNumberOfPlayers', 'currentMap', 'status', 'uptime', 'actions'],
    connected: false,
    refreshInterval: null
  },
  methods: {
    loadCredentials() {
      this.ipAddress = localStorage.getItem('ipAddress') || '';
      this.port = localStorage.getItem('port') || '';
      this.apiKey = localStorage.getItem('apiKey') || '';
      if (this.ipAddress && this.port && this.apiKey) {
        this.listServers();
      }
    },
    saveCredentials() {
      localStorage.setItem('ipAddress', this.ipAddress);
      localStorage.setItem('port', this.port);
      localStorage.setItem('apiKey', this.apiKey);
    },
    removeCredentials() {
      localStorage.removeItem('ipAddress');
      localStorage.removeItem('port');
      localStorage.removeItem('apiKey');
    },
    apiURL(action, serverId) {
      if (serverId !== undefined) {
        return `http://${this.ipAddress}:${this.port}/api/servers/${action}/${serverId}?apikey=${this.apiKey}`;
      }
      return `http://${this.ipAddress}:${this.port}/api/servers?apikey=${this.apiKey}`;
    },
    listServers() {
      $.get(this.apiURL('', undefined), (response) => {
        if (response.success) {
          this.servers = response.data;
          this.connected = true;
          this.saveCredentials();
        }
      });
    },
    startServer(id) {
      $.get(this.apiURL('start', id), (response) => {
        if (response.success) {
          this.listServers();
        }
      });
    },
    stopServer(id) {
      $.get(this.apiURL('stop', id), (response) => {
        if (response.success) {
          this.listServers();
        }
      });
    },
    restartServer(id) {
      $.get(this.apiURL('restart', id), (response) => {
        if (response.success) {
          this.listServers();
        }
      });
    },
    updateServer(id) {
      $.get(this.apiURL('update', id), (response) => {
        if (response.success) {
          this.listServers();
        }
      });
    },
    disconnect() {
      this.connected = false;
      this.removeCredentials();  // Remove the credentials from localStorage
      clearInterval(this.refreshInterval);
    },
    startPolling() {
      // If already polling, first clear the existing interval
      if (this.refreshInterval) {
        clearInterval(this.refreshInterval);
      }

      // Set up the interval
      this.refreshInterval = setInterval(() => {
        if (this.connected) {
          this.listServers();
        }
      }, 1000); // Polls every 1 second
    },
  },
  mounted() {
    this.loadCredentials();  // Load the credentials when the component is mounted
    this.startPolling();
  },
  beforeDestroy() {
    // Clear the polling interval before the component is destroyed
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
    }
  }
});
