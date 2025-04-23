// Region Data
const regionData = {
  "Chicago": {
    name: "Chicago",
    states: ["Indiana", "Illinois"],
    rdpConnection: "192.168.24.181",
    ipRanges: "10.247.155.216/30",
    routerIp: "10.247.155.217",
    exfoIp: "10.247.155.218",
    routerOptions: ["Mikrotik", "Juniper", "Nokia"],
    deviceInfo: "Core Router: CR-CHI-01"
  },
  "Dallas": {
    name: "Dallas",
    states: ["Texas", "Oklahoma", "Louisiana"],
    rdpConnection: "10.2.12.150",
    ipRanges: "10.39.1.168/30",
    routerIp: "10.39.1.169",
    exfoIp: "10.39.1.170",
    routerOptions: ["Mikrotik", "Juniper", "Nokia"],
    deviceInfo: "Core Router: CR-DAL-01"
  },
  "Nebraska": {
    name: "Nebraska",
    states: ["Nebraska"],
    rdpConnection: "10.91.44.18",
    ipRanges: "10.91.44.0/24",
    routerOptions: ["Mikrotik", "Juniper", "Nokia"],
    deviceInfo: "Core Router: CR-NEB-01"
  },
  "Kansas": {
    name: "Kansas",
    states: ["Kansas"],
    rdpConnection: "10.254.248.126",
    ipRanges: "10.248.88.100/30",
    routerIp: "10.248.88.101",
    exfoIp: "10.248.88.102",
    routerOptions: ["Mikrotik", "Juniper", "Nokia"],
    deviceInfo: "Core Router: CR-KAN-01"
  }
};

// App State
let state = {
  selectedRegion: null,
  selectedRouter: null,
  isROS7: true,
  port: "",
  ipAddress: "",
  subnet: "30",
  ospfArea: "0",
  generatedScript: "",
  step: 1
};

// DOM Elements
const progressFill = document.getElementById('progress-fill');
const currentStepEl = document.getElementById('current-step');
const regionButtonsContainer = document.getElementById('region-buttons');
const resetButton = document.getElementById('reset-button');
const welcomeScreen = document.getElementById('welcome-screen');
const configContainer = document.getElementById('config-container');
const routerSelection = document.getElementById('router-selection');
const routerButtonsContainer = document.getElementById('router-buttons');
const routerVersion = document.getElementById('router-version');
const ros7Button = document.getElementById('ros7-button');
const ros6Button = document.getElementById('ros6-button');
const configParams = document.getElementById('config-params');
const portInput = document.getElementById('port-input');
const ipInput = document.getElementById('ip-input');
const subnetInput = document.getElementById('subnet-input');
const areaInput = document.getElementById('area-input');
const areaHint = document.getElementById('area-hint');
const generateButton = document.getElementById('generate-button');
const scriptOutput = document.getElementById('script-output');
const scriptContent = document.getElementById('script-content');
const copyButton = document.getElementById('copy-button');
const regionInfo = document.getElementById('region-info');
const routerInfo = document.getElementById('router-info');
const routerTypeDisplay = document.getElementById('router-type-display');
const helpList = document.getElementById('help-list');

// Initialize the app
function initApp() {
  // Create region buttons
  for (const region in regionData) {
    const button = document.createElement('button');
    button.className = 'region-button';
    button.textContent = region;
    button.dataset.region = region;
    regionButtonsContainer.appendChild(button);
    
    button.addEventListener('click', () => {
      handleRegionSelect(region);
    });
  }
  
  // Event Listeners
  resetButton.addEventListener('click', resetApp);
  ros7Button.addEventListener('click', () => setRouterVersion(true));
  ros6Button.addEventListener('click', () => setRouterVersion(false));
  generateButton.addEventListener('click', generateScript);
  copyButton.addEventListener('click', copyToClipboard);
  
  portInput.addEventListener('input', (e) => { state.port = e.target.value; });
  ipInput.addEventListener('input', (e) => { state.ipAddress = e.target.value; });
  subnetInput.addEventListener('input', (e) => { state.subnet = e.target.value; });
  areaInput.addEventListener('input', (e) => { state.ospfArea = e.target.value; });
}

// Update the UI based on the current step
function updateStep(step) {
  state.step = step;
  currentStepEl.textContent = step;
  progressFill.style.width = `${step * 25}%`;
  
  // Update help list based on selected router
  updateHelpList();
}

// Handle region selection
function handleRegionSelect(region) {
  state.selectedRegion = regionData[region];
  state.selectedRouter = null;
  state.port = "";
  state.ipAddress = "";
  state.subnet = "30";
  state.generatedScript = "";
  
  // Update UI
  document.querySelectorAll('.region-button').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.region === region);
  });
  
  welcomeScreen.classList.add('hidden');
  configContainer.classList.remove('hidden');
  routerSelection.classList.remove('hidden');
  configParams.classList.add('hidden');
  scriptOutput.classList.add('hidden');
  
  // Populate router buttons
  routerButtonsContainer.innerHTML = '';
  state.selectedRegion.routerOptions.forEach(router => {
    const button = document.createElement('button');
    button.className = 'router-button';
    button.dataset.router = router;
    
    // Router icon
    const icon = document.createElement('div');
    icon.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="8" rx="2" ry="2"></rect><rect x="2" y="14" width="20" height="8" rx="2" ry="2"></rect><line x1="6" y1="6" x2="6.01" y2="6"></line><line x1="6" y1="18" x2="6.01" y2="18"></line></svg>`;
    
    const text = document.createElement('span');
    text.textContent = router;
    
    button.appendChild(icon);
    button.appendChild(text);
    routerButtonsContainer.appendChild(button);
    
    button.addEventListener('click', () => {
      handleRouterSelect(router);
    });
  });
  
  // Populate region info
  populateRegionInfo();
  
  updateStep(2);
}

// Handle router selection
function handleRouterSelect(router) {
  state.selectedRouter = router;
  
  // Update UI
  document.querySelectorAll('.router-button').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.router === router);
  });
  
  routerVersion.classList.toggle('hidden', router !== 'Mikrotik');
  configParams.classList.remove('hidden');
  
  // Update router info
  routerInfo.classList.remove('hidden');
  routerTypeDisplay.textContent = router;
  
  // Set appropriate IP address
  if (state.selectedRegion.routerIp) {
    state.ipAddress = state.selectedRegion.routerIp;
    ipInput.value = state.ipAddress;
  }
  
  // Update area hint
  updateAreaHint();
  
  updateStep(3);
}

// Set router OS version
function setRouterVersion(isROS7) {
  state.isROS7 = isROS7;
  ros7Button.classList.toggle('active', isROS7);
  ros6Button.classList.toggle('active', !isROS7);
  
  // Update area hint
  updateAreaHint();
}

// Update area hint based on router type and version
function updateAreaHint() {
  if (state.selectedRouter === 'Mikrotik') {
    if (state.isROS7) {
      areaHint.textContent = "For RouterOS 7, use a simple number like '0' or '42'";
    } else {
      areaHint.textContent = "For RouterOS 6, use a simple number like '0' or 'backbone'";
    }
  } else {
    areaHint.textContent = "Use format 0.0.0.0 for Juniper/Nokia";
  }
}

// Populate region information
function populateRegionInfo() {
  const region = state.selectedRegion;
  
  let html = `
    <div class="info-item">
      <label>Region</label>
      <p>${region.name}</p>
    </div>
    
    <div class="info-item">
      <label>States</label>
      <p>${region.states.join(', ')}</p>
    </div>
    
    <div class="info-item">
      <label>Network Range</label>
      <p>${region.ipRanges}</p>
    </div>
  `;
  
  if (region.routerIp) {
    html += `
      <div class="info-item">
        <label>Router IP</label>
        <p>${region.routerIp}</p>
      </div>
    `;
  }
  
  if (region.exfoIp) {
    html += `
      <div class="info-item">
        <label>EXFO Device IP</label>
        <p>${region.exfoIp}</p>
      </div>
    `;
  }
  
  html += `
    <div class="info-item">
      <label>Device Information</label>
      <p>${region.deviceInfo}</p>
    </div>
    
    <div class="info-item">
      <label>RDP Connection</label>
      <div class="rdp-container">
        <code class="rdp-code">${region.rdpConnection}</code>
        <button class="rdp-button" id="rdp-button">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect><line x1="8" y1="21" x2="16" y2="21"></line><line x1="12" y1="17" x2="12" y2="21"></line></svg>
        </button>
      </div>
    </div>
  `;
  
  regionInfo.innerHTML = html;
  
  // Add RDP button event listener
  document.getElementById('rdp-button').addEventListener('click', () => {
    openRdpConnection(region.rdpConnection);
  });
}

// Update help list based on selected router
function updateHelpList() {
  let helpItems = [
    '• Choose a router type for your region',
    '• Enter the port name you want to configure',
    '• Verify the IP address (auto-populated)',
    '• Confirm subnet mask (default /30)',
    '• Set OSPF area (format depends on router type)',
    '• Copy the generated script to configure your router'
  ];
  
  if (state.selectedRouter === 'Mikrotik') {
    helpItems.splice(1, 0, '• Select RouterOS version (6.x or 7.x)');
  }
  
  helpList.innerHTML = helpItems.map(item => `<li>${item}</li>`).join('');
}

// Generate script
function generateScript() {
  if (!state.port || !state.ipAddress || !state.subnet || !state.ospfArea) {
    alert("Please fill in all fields");
    return;
  }
  
  // Extract network IP from router IP for OSPF network
  const ipParts = state.ipAddress.split('.');
  const lastOctet = parseInt(ipParts[3]);
  const networkIp = ipParts.slice(0, 3).join('.') + '.' + (lastOctet & ~3); // Assuming /30 network
  
  let script = "";
  
  switch (state.selectedRouter) {
    case "Mikrotik":
      if (state.isROS7) {
        script = `# Mikrotik RouterOS 7.x Configuration for EXFO Test
# Setup script
/interface ethernet set [ find where name="${state.port}" ] comment="exfo"
/ip address add address=${state.ipAddress}/${state.subnet} interface=${state.port} comment="exfo"
/routing ospf interface-template/set networks=${networkIp}/${state.subnet} area=${state.ospfArea} interfaces=${state.port} type=broadcast

# Reversal script
# /interface ethernet set [ find where comment="exfo" ] comment=""
# /ip address remove [ find where comment="exfo" ]
# /routing ospf interface-template/unset networks=${networkIp}/${state.subnet}`;
      } else {
        script = `# Mikrotik RouterOS 6.x Configuration for EXFO Test
# Setup script
/interface ethernet set [ find where name="${state.port}" ] comment="exfo"
/ip address add address=${state.ipAddress}/${state.subnet} interface=${state.port} comment="exfo"
/routing ospf network add network=${networkIp}/${state.subnet} area=${state.ospfArea} comment="exfo"
/routing ospf interface add interface=${state.port} network-type=broadcast comment="exfo"

# Reversal script
# /interface ethernet set [ find where comment="exfo" ] comment=""
# /ip address remove [ find where comment="exfo" ]
# /routing ospf network remove [ find where comment="exfo" ]
# /routing ospf interface remove [ find where comment="exfo" ]`;
      }
      break;
      
    case "Juniper":
        script = `# Juniper Router Configuration for EXFO Test
        # Setup script
        set interfaces ${state.port} description "exfo"
        set interfaces ${state.port} unit 0 family inet address ${state.ipAddress}/${state.subnet}
        set protocols ospf area ${state.ospfArea} interface ${state.port} interface-type broadcast
        set protocols ospf area ${state.ospfArea} interface ${state.port} network ${networkIp}/${state.subnet}
        set routing-options annotation exfo "EXFO test configuration"
        
        # Reversal script
        # delete interfaces ${state.port} description
        # delete interfaces ${state.port} unit 0 family inet address ${state.ipAddress}/${state.subnet}
        # delete protocols ospf area ${state.ospfArea} interface ${state.port}
        # delete routing-options annotation exfo`;
      break;
      
    case "Nokia":
        script = `# Nokia Router Configuration for EXFO Test
        # Setup script
        configure router interface "${state.port}"
        description "exfo"
        address ${state.ipAddress}/${state.subnet}
        exit
        configure router ospf
        area ${state.ospfArea}
        interface "${state.port}"
        interface-type broadcast
        exit
        network ${networkIp}/${state.subnet}
        exit
        exit
        
        # Reversal script
        # configure router interface "${state.port}"
        # no description
        # no address
        # exit
        # configure router ospf
        # area ${state.ospfArea}
        # no interface "${state.port}"
        # no network ${networkIp}/${state.subnet}
        # exit
        # exit`;
      break;
      
    default:
      script = "Router type not selected";
  }
  
  state.generatedScript = script;
  scriptContent.textContent = script;
  scriptOutput.classList.remove('hidden');
  
  updateStep(4);
}

// Copy script to clipboard
function copyToClipboard() {
  // Use navigator clipboard API if available
  if (navigator.clipboard) {
    navigator.clipboard.writeText(state.generatedScript);
  } else {
    // Fallback for older browsers
    const textArea = document.createElement('textarea');
    textArea.value = state.generatedScript;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand('copy');
    document.body.removeChild(textArea);
  }
  
  // Visual feedback
  copyButton.classList.add('copied');
  copyButton.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon"><polyline points="20 6 9 17 4 12"></polyline></svg>
    Copied!
  `;
  
  setTimeout(() => {
    copyButton.classList.remove('copied');
    copyButton.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
      Copy to clipboard
    `;
  }, 2000);
}

// Open RDP connection
function openRdpConnection(host) {
  // Check if we're in Electron with IPC
  if (window.electron) {
    window.electron.openRDP(host);
  } else {
    alert(`Opening RDP connection to ${host}`);
  }
}

// Reset the application
function resetApp() {
  state = {
    selectedRegion: null,
    selectedRouter: null,
    isROS7: true,
    port: "",
    ipAddress: "",
    subnet: "30",
    ospfArea: "0",
    generatedScript: "",
    step: 1
  };
  
  // Reset UI
  document.querySelectorAll('.region-button').forEach(btn => {
    btn.classList.remove('active');
  });
  
  welcomeScreen.classList.remove('hidden');
  configContainer.classList.add('hidden');
  routerSelection.classList.add('hidden');
  configParams.classList.add('hidden');
  scriptOutput.classList.add('hidden');
  routerInfo.classList.add('hidden');
  
  // Reset form fields
  portInput.value = '';
  ipInput.value = '';
  subnetInput.value = '30';
  areaInput.value = '0';
  
  updateStep(1);
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', initApp);