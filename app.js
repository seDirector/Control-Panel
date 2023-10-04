const { createApp } = Vue
createApp({
    data() {
        return {
            ipAddress: 'cp-demo.sedirector.net',
            port: '443',
            apiKey: '8aQ2DSRFqpLihtO34XiFVIpD',
            servers: [],
            fields: ['status', 'id', 'game', 'name', 'port', 'currentNumberOfPlayers', 'currentMap', 'uptime', 'actions'],
            connected: false,
            refreshInterval: null,
            currentPage: 0,
            pageSize: 8,
            showModal: false,
            currentFilter: null,
            showFilters: true,
            searchTerm: '',
            activeFilter: null,
            isFilterActive: false,
            currentAction: ''
        };
    },
    methods: {
        loadCredentials() {
            // Disabled for demo
            /* this.ipAddress = localStorage.getItem('ipAddress') || '';
            this.port = localStorage.getItem('port') || '';
            this.apiKey = localStorage.getItem('apiKey') || '';

            // Check if credentials are available before calling listServers
            if (this.ipAddress && this.port && this.apiKey) {
                this.listServers();
            } */
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
        searchServers() {
            if (!this.searchTerm) return this.servers;

            return this.servers.filter(server => {
                return server.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
                    server.game.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
                    server.status.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
                    server.port.toString().includes(this.searchTerm);  // If port is a number
            });
        },
        setFilter(filterType) {
            this.currentFilter = filterType;
            this.filterServers();
        },
        filterServers() {
            // Depending on the filter type, we can apply different filtering logic
            switch (this.currentFilter) {
                case 'game':
                    this.servers.sort((a, b) => a.game.localeCompare(b.game));
                    break;
                case 'name':
                    this.servers.sort((a, b) => a.name.localeCompare(b.name));
                    break;
                case 'status':
                    this.servers.sort((a, b) => a.status.localeCompare(b.status));
                    break;
                case 'port':
                    this.servers.sort((a, b) => a.port - b.port); // Assuming port is a number
                    break;
                default:
                    // Default sort logic
                    this.servers.sort((a, b) => a.id - b.id); // Assuming ID is a number
                    break;
            }
        },
        listServers() {
            $.get(this.apiURL('', undefined), (response) => {
                if (response.success) {
                    this.servers = response.data;
                    this.connected = true;
                    this.saveCredentials();

                    // Apply the current filter after fetching the list
                    if (this.currentFilter) {
                        this.filterServers();
                    }
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
        disconnectAndReload() {
            this.removeCredentials(); // Ensure credentials are removed before reloading
            window.location.reload(); // Refresh the page
        },
        disconnect() {
            this.connected = false;
            this.removeCredentials();
            clearInterval(this.refreshInterval);
        },
        startPolling() {
            if (this.refreshInterval) {
                clearInterval(this.refreshInterval);
            }
            this.refreshInterval = setInterval(() => {
                if (this.connected) {
                    this.listServers();
                }
            }, 1000);
        },
        nextPage() {
            if (this.currentPage < Math.ceil(this.filteredServers.length / this.pageSize) - 1) {
                this.currentPage++;
            }

        },
        previousPage() {
            if (this.currentPage > 0) {
                this.currentPage--;
            }

        },
        confirmAction(action) {
            this.currentAction = action;
            this.showModal = true;
        },
        executeAction() {
            if (this.currentAction === 'startAll') {
                this.startAllServers();
            } else if (this.currentAction === 'stopAll') {
                this.stopAllServers();
            } else if (this.currentAction === 'restartAll') {
                this.restartAllServers();
            } else if (this.currentAction === 'updateAll') {
                this.updateAllServers();
            }
        },
        startAllServers() {
            $.get(this.apiURL('start', 'all'), (response) => {
                if (response.success) {
                    this.listServers();
                }
            });
        },
        stopAllServers() {
            $.get(this.apiURL('stop', 'all'), (response) => {
                if (response.success) {
                    this.listServers();
                }
            });
        },
        restartAllServers() {
            $.get(this.apiURL('restart', 'all'), (response) => {
                if (response.success) {
                    this.listServers();
                }
            });
        },
        updateAllServers() {
            $.get(this.apiURL('update', 'all'), (response) => {
                if (response.success) {
                    this.listServers();
                }
            });
        },
        shouldShowIconInActions(server) {
            const statusIconMap = {
                'Updating': 'https://i.ibb.co/cTtNPLB/icons8-update.gif',
                'Update Starting': 'https://i.ibb.co/cTtNPLB/icons8-update.gif',
                'Stopping': 'https://i.ibb.co/gMQC4c7/icons8-loading-2.gif',
                'Error Starting': 'https://i.ibb.co/TLjDLt5/icons8-error.gif',
                'Starting': 'https://i.ibb.co/6gCpQXx/icons8-loading-1.gif',
            };

            return statusIconMap[server.status] || '';
        },
        getStatusIconUrl(status) {
            const statusIcons = {
                'Offline': 'https://i.ibb.co/VgHk2WM/offline.png',
                'Running': 'https://i.ibb.co/pxtxwvz/running.png',
                'Error Starting': 'https://i.ibb.co/TLjDLt5/icons8-error.gif',
                'Restarting': 'https://i.ibb.co/g415yBM/restarting.png',
                'Updating': 'https://i.ibb.co/cTtNPLB/icons8-update.gif',
                'Update Starting': 'https://i.ibb.co/cTtNPLB/icons8-update.gif',
                'Stopping': 'https://i.ibb.co/gMQC4c7/icons8-loading-2.gif',
                'Starting': 'https://i.ibb.co/6gCpQXx/icons8-loading-1.gif',
            };

            if (!statusIcons[status]) {
                console.error('Unknown server status:', status);
                return '';  // Default icon or keep it empty
            }

            return statusIcons[status];
        }
    },
    computed: {
        paginatedServers() {
            const filteredServers = this.searchServers();
            const start = this.currentPage * this.pageSize;
            const end = start + this.pageSize;
            return filteredServers.slice(start, end);
        },
        filteredServers() {
            if (!this.searchTerm) return this.servers;

            return this.servers.filter(server => {
                return (server.name ? server.name.includes(this.searchTerm) : false) ||
                    (server.game ? server.game.includes(this.searchTerm) : false) ||
                    (server.status ? server.status.includes(this.searchTerm) : false) ||
                    (server.port ? server.port.includes(this.searchTerm) : false) ||
                    (server.serverid ? server.serverid.includes(this.searchTerm) : false);
            });
        },
        getGameIconUrl() {
            const gameIconUrls = {
                'Counter-Strike: Source': 'https://cdn.cloudflare.steamstatic.com/steamcommunity/public/images/apps/240/9052fa60c496a1c03383b27687ec50f4bf0f0e10.jpg',
                'Counter-Strike: Global Offensive': 'https://cdn.cloudflare.steamstatic.com/steamcommunity/public/images/apps/730/69f7ebe2735c366c65c0b33dae00e12dc40edbe4.jpg',
                'Left 4 Dead 2': 'https://cdn.cloudflare.steamstatic.com/steamcommunity/public/images/apps/550/7d5a243f9500d2f8467312822f8af2a2928777ed.jpg',
                'Age of Chivalry': 'https://cdn.cloudflare.steamstatic.com/steamcommunity/public/images/apps/17510/c13110cfe96f0157c2ebd2e5b57a1aee6895dc95.jpg',
                'Alien Swarm': 'https://cdn.cloudflare.steamstatic.com/steamcommunity/public/images/apps/630/67126b5081b423af53f5e88e8e81d91b15daa644.jpg',
                'Alien Swarm: Reactive Drop': 'https://cdn.cloudflare.steamstatic.com/steamcommunity/public/images/apps/563560/3f30d5d196532aa1d79dbf133f067a38769178dc.jpg',
                'D.I.P.R.I.P. Warm Up': 'https://cdn.cloudflare.steamstatic.com/steamcommunity/public/images/apps/17530/3f8cb122a58b0a0a35bbdabb0d17a34e057909fc.jpg',
                'Day of Defeat: Source': 'https://cdn.cloudflare.steamstatic.com/steamcommunity/public/images/apps/300/062754bb5853b0534283ae27dc5d58200692b22d.jpg',
                'Garry\'s Mod': 'https://cdn.cloudflare.steamstatic.com/steamcommunity/public/images/apps/4000/4a6f25cfa2426445d0d9d6e233408de4d371ce8b.jpg',
                'Half-Life 2: Deathmatch': 'https://cdn.cloudflare.steamstatic.com/steamcommunity/public/images/apps/320/795e85364189511f4990861b578084deef086cb1.jpg',
                'Insurgency': 'https://cdn.cloudflare.steamstatic.com/steamcommunity/public/images/apps/222880/b072fc4239951c1952f4877edde340419438b528.jpg',
                'Left 4 Dead': 'https://cdn.cloudflare.steamstatic.com/steamcommunity/public/images/apps/500/428df26bc35b09319e31b1ffb712487b20b3245c.jpg',
                'No More Room In Hell': 'https://cdn.cloudflare.steamstatic.com/steamcommunity/public/images/apps/224260/684de0d9c5749b5ddd52f120894fd97efd620b1d.jpg',
                'Synergy': 'https://cdn.cloudflare.steamstatic.com/steamcommunity/public/images/apps/1989070/8d0699a05463f5638a1eddd0a690cfcae9cd6424.jpg',
                'Team Fortress 2': 'https://cdn.cloudflare.steamstatic.com/steamcommunity/public/images/apps/440/e3f595a92552da3d664ad00277fad2107345f743.jpg',
                'Team Fortress 2 Classic': 'https://cdn.statically.io/gh/int-72h/TF2CDownloader/main/tf2c.ico',
                'Zombie Panic! Source': 'https://cdn.cloudflare.steamstatic.com/steamcommunity/public/images/apps/17500/e74eb496df79432ed99a45644ed54d1572f3e385.jpg'
            };

            return (gameName) => {
                return gameIconUrls[gameName] || '';
            };
        }
    },
    mounted() {
        this.loadCredentials();
        this.startPolling();
    },
    beforeUnmount() {
        if (this.refreshInterval) {
            clearInterval(this.refreshInterval);
        }
    }
}).mount('#app');