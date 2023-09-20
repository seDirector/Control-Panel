new Vue({
    el: '#app',
    data: {
      ipAddress: 'localhost',
      port: '10447',
      apiKey: '',
      servers: [],
      fields: ['id', 'name', 'status', 'actions']
    },
    methods: {
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
      }
    }
  });