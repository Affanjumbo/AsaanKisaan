const storageKey = "ak_admin_state";

const defaultState = {
  verification: [
    { id: "v1", type: "Farmer", name: "Ahmed Khan", location: "South Punjab", status: "pending" },
    { id: "v2", type: "Industry", name: "GrainCo Ltd", location: "Karachi", status: "approved" },
    { id: "v3", type: "Partner", name: "AgroSupplies", location: "Lahore", status: "pending" }
  ],
  pricing: [
    { id: "p1", crop: "Wheat", price: 4950, commission: 2.5 },
    { id: "p2", crop: "Rice 1121", price: 6800, commission: 3.2 }
  ],
  partners: [
    { id: "ip1", name: "SeedPro", status: "active", category: "Seed" },
    { id: "ip2", name: "NPK Max", status: "active", category: "Fertilizer" },
    { id: "ip3", name: "SafeSpray", status: "paused", category: "Pesticide" }
  ],
  logistics: [
    { id: "l1", route: "South Punjab → Lahore Hub", status: "scheduled", eta: "09:30 AM" },
    { id: "l2", route: "Sindh East → Karachi Port", status: "in-transit", eta: "12:10 PM" }
  ],
  disputes: [
    { id: "d1", title: "Quality variance - Rice 1121", status: "open" },
    { id: "d2", title: "Payment delay - Cluster 4", status: "open" },
    { id: "d3", title: "Quantity shortfall - Wheat A", status: "resolved" }
  ],
  matches: []
};

const state = loadState();

const verificationTable = document.getElementById("verificationTable");
const verificationForm = document.getElementById("verificationForm");
const verificationFilter = document.getElementById("verificationFilter");
const seedVerification = document.getElementById("seedVerification");

const runMatch = document.getElementById("runMatch");
const matchResults = document.getElementById("matchResults");

const pricingForm = document.getElementById("pricingForm");
const pricingTable = document.getElementById("pricingTable");
const resetPricing = document.getElementById("resetPricing");

const partnerList = document.getElementById("partnerList");
const addPartner = document.getElementById("addPartner");

const logisticsTable = document.getElementById("logisticsTable");
const addRoute = document.getElementById("addRoute");

const disputeTable = document.getElementById("disputeTable");
const disputeFilter = document.getElementById("disputeFilter");

const analyticsGrid = document.getElementById("analyticsGrid");
const refreshAnalytics = document.getElementById("refreshAnalytics");

function loadState() {
  const saved = localStorage.getItem(storageKey);
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch (error) {
      return structuredClone(defaultState);
    }
  }
  return structuredClone(defaultState);
}

function saveState() {
  localStorage.setItem(storageKey, JSON.stringify(state));
}

function uid(prefix) {
  return `${prefix}-${Math.random().toString(36).slice(2, 9)}`;
}

function renderVerification() {
  const filterValue = verificationFilter.value;
  const rows = state.verification.filter((item) => filterValue === "all" || item.status === filterValue);
  verificationTable.innerHTML = rows
    .map((item) => {
      return `
        <div class="table-row" data-row-id="${item.id}">
          <div>
            <strong>${item.type}</strong> - ${item.name}
            <div class="muted">${item.location}</div>
          </div>
          <div class="row-actions">
            <span class="tag ${item.status}">${item.status}</span>
            <button class="action-btn" data-action="approve" data-id="${item.id}">Approve</button>
            <button class="action-btn" data-action="reject" data-id="${item.id}">Reject</button>
            <button class="action-btn danger" data-action="remove" data-id="${item.id}">Remove</button>
          </div>
        </div>
      `;
    })
    .join("");
}

function renderPricing() {
  pricingTable.innerHTML = state.pricing
    .map((item) => {
      return `
        <div class="table-row" data-row-id="${item.id}">
          <div>
            <strong>${item.crop}</strong>
            <div class="muted">Target: PKR ${item.price}</div>
          </div>
          <div class="row-actions">
            <span class="tag neutral">${item.commission}%</span>
            <button class="action-btn" data-action="edit-price" data-id="${item.id}">Edit</button>
            <button class="action-btn danger" data-action="remove-price" data-id="${item.id}">Remove</button>
          </div>
        </div>
      `;
    })
    .join("");
}

function renderPartners() {
  partnerList.innerHTML = state.partners
    .map((partner) => {
      return `
        <div class="table-row" data-row-id="${partner.id}">
          <div>
            <strong>${partner.name}</strong>
            <div class="muted">${partner.category}</div>
          </div>
          <div class="row-actions">
            <span class="tag ${partner.status}">${partner.status}</span>
            <button class="action-btn" data-action="toggle-partner" data-id="${partner.id}">Toggle</button>
            <button class="action-btn danger" data-action="remove-partner" data-id="${partner.id}">Remove</button>
          </div>
        </div>
      `;
    })
    .join("");
}

function renderLogistics() {
  logisticsTable.innerHTML = state.logistics
    .map((route) => {
      return `
        <div class="table-row" data-row-id="${route.id}">
          <div>
            <strong>${route.route}</strong>
            <div class="muted">ETA: ${route.eta}</div>
          </div>
          <div class="row-actions">
            <span class="tag ${route.status}">${route.status}</span>
            <button class="action-btn" data-action="advance-route" data-id="${route.id}">Advance</button>
            <button class="action-btn danger" data-action="remove-route" data-id="${route.id}">Remove</button>
          </div>
        </div>
      `;
    })
    .join("");
}

function renderDisputes() {
  const filterValue = disputeFilter.value;
  const rows = state.disputes.filter((item) => filterValue === "all" || item.status === filterValue);
  disputeTable.innerHTML = rows
    .map((item) => {
      return `
        <div class="table-row" data-row-id="${item.id}">
          <div>
            <strong>${item.title}</strong>
            <div class="muted">Case ID: ${item.id}</div>
          </div>
          <div class="row-actions">
            <span class="tag ${item.status}">${item.status}</span>
            <button class="action-btn" data-action="resolve" data-id="${item.id}">Resolve</button>
            <button class="action-btn danger" data-action="remove-dispute" data-id="${item.id}">Remove</button>
          </div>
        </div>
      `;
    })
    .join("");
}

function renderMatches() {
  if (!state.matches.length) {
    matchResults.innerHTML = "<div class=\"muted\">Run the matching engine to see supply allocation suggestions.</div>";
    return;
  }

  matchResults.innerHTML = state.matches
    .map((match) => {
      return `
        <div class="match-card table-row" data-row-id="${match.id}">
          <div>
            <strong>${match.demand}</strong>
            <div class="muted">${match.location}</div>
          </div>
          <div class="row-actions">
            <span class="tag approved">${match.coverage}% coverage</span>
            <button class="action-btn" data-action="confirm-match" data-id="${match.id}">Confirm</button>
          </div>
        </div>
      `;
    })
    .join("");
}

function renderAnalytics() {
  const pending = state.verification.filter((item) => item.status === "pending").length;
  const activePartners = state.partners.filter((item) => item.status === "active").length;
  const openDisputes = state.disputes.filter((item) => item.status === "open").length;
  const activeRoutes = state.logistics.filter((item) => item.status !== "completed").length;

  analyticsGrid.innerHTML = `
    <div class="stat-card">
      <span class="stat-label">Pending Verifications</span>
      <span class="stat-value">${pending}</span>
    </div>
    <div class="stat-card">
      <span class="stat-label">Active Partners</span>
      <span class="stat-value">${activePartners}</span>
    </div>
    <div class="stat-card">
      <span class="stat-label">Open Disputes</span>
      <span class="stat-value">${openDisputes}</span>
    </div>
    <div class="stat-card">
      <span class="stat-label">Active Routes</span>
      <span class="stat-value">${activeRoutes}</span>
    </div>
  `;
}

function renderAll() {
  renderVerification();
  renderPricing();
  renderPartners();
  renderLogistics();
  renderDisputes();
  renderMatches();
  renderAnalytics();
}

function flashRow(container, id, className) {
  if (!className) return;
  window.requestAnimationFrame(() => {
    const row = container.querySelector(`[data-row-id="${id}"]`);
    if (!row) return;
    row.classList.add(className);
    window.setTimeout(() => row.classList.remove(className), 700);
  });
}

verificationForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const formData = new FormData(verificationForm);
  const entry = {
    id: uid("v"),
    type: formData.get("type"),
    name: formData.get("name"),
    location: formData.get("location"),
    status: "pending"
  };
  state.verification.unshift(entry);
  verificationForm.reset();
  saveState();
  renderVerification();
  renderAnalytics();
});

verificationTable.addEventListener("click", (event) => {
  const button = event.target.closest("button");
  if (!button) return;
  const { action, id } = button.dataset;
  const item = state.verification.find((entry) => entry.id === id);
  if (!item) return;

  let flashClass = "";

  if (action === "approve") {
    item.status = "approved";
    flashClass = "status-approve";
  }

  if (action === "reject") {
    item.status = "rejected";
    flashClass = "status-reject";
  }
  if (action === "remove") state.verification = state.verification.filter((entry) => entry.id !== id);

  saveState();
  renderVerification();
  renderAnalytics();

  flashRow(verificationTable, id, flashClass);
});

verificationFilter.addEventListener("change", renderVerification);

seedVerification.addEventListener("click", () => {
  state.verification = structuredClone(defaultState.verification);
  saveState();
  renderVerification();
  renderAnalytics();
});

runMatch.addEventListener("click", () => {
  state.matches = [
    { id: uid("m"), demand: "Rice 1121 - 80 tons", location: "Sindh East", coverage: 92 },
    { id: uid("m"), demand: "Wheat A - 120 tons", location: "Central Punjab", coverage: 84 },
    { id: uid("m"), demand: "Cotton - 45 tons", location: "South Punjab", coverage: 76 }
  ];
  saveState();
  renderMatches();
  if (state.matches[0]) flashRow(matchResults, state.matches[0].id, "status-neutral");
});

matchResults.addEventListener("click", (event) => {
  const button = event.target.closest("button");
  if (!button) return;
  const { id } = button.dataset;
  const match = state.matches.find((entry) => entry.id === id);
  if (!match) return;
  match.coverage = Math.min(100, match.coverage + 4);
  saveState();
  renderMatches();
  flashRow(matchResults, id, "status-approve");
});

pricingForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const formData = new FormData(pricingForm);
  const entry = {
    id: uid("p"),
    crop: formData.get("crop"),
    price: Number(formData.get("price")),
    commission: Number(formData.get("commission"))
  };
  state.pricing.unshift(entry);
  pricingForm.reset();
  saveState();
  renderPricing();
  flashRow(pricingTable, entry.id, "status-approve");
});

pricingTable.addEventListener("click", (event) => {
  const button = event.target.closest("button");
  if (!button) return;
  const { action, id } = button.dataset;
  const item = state.pricing.find((entry) => entry.id === id);
  if (!item) return;

  let flashClass = "status-neutral";
  if (action === "remove-price") {
    state.pricing = state.pricing.filter((entry) => entry.id !== id);
    flashClass = "status-reject";
  }

  if (action === "edit-price") {
    item.price += 150;
    item.commission = Number((item.commission + 0.2).toFixed(1));
  }

  saveState();
  renderPricing();
  flashRow(pricingTable, id, flashClass);
});

resetPricing.addEventListener("click", () => {
  state.pricing = structuredClone(defaultState.pricing);
  saveState();
  renderPricing();
});

addPartner.addEventListener("click", () => {
  const entry = {
    id: uid("ip"),
    name: `Partner ${state.partners.length + 1}`,
    status: "active",
    category: "Inputs"
  };
  state.partners.unshift(entry);
  saveState();
  renderPartners();
  renderAnalytics();
  flashRow(partnerList, entry.id, "status-approve");
});

partnerList.addEventListener("click", (event) => {
  const button = event.target.closest("button");
  if (!button) return;
  const { action, id } = button.dataset;
  const partner = state.partners.find((entry) => entry.id === id);
  if (!partner) return;

  let flashClass = "status-neutral";
  if (action === "toggle-partner") {
    partner.status = partner.status === "active" ? "paused" : "active";
    flashClass = partner.status === "active" ? "status-approve" : "status-reject";
  }

  if (action === "remove-partner") {
    state.partners = state.partners.filter((entry) => entry.id !== id);
    flashClass = "status-reject";
  }

  saveState();
  renderPartners();
  renderAnalytics();
  flashRow(partnerList, id, flashClass);
});

addRoute.addEventListener("click", () => {
  const entry = {
    id: uid("l"),
    route: `Cluster ${state.logistics.length + 1} → Hub`,
    status: "scheduled",
    eta: "Tomorrow 10:15 AM"
  };
  state.logistics.unshift(entry);
  saveState();
  renderLogistics();
  renderAnalytics();
  flashRow(logisticsTable, entry.id, "status-approve");
});

logisticsTable.addEventListener("click", (event) => {
  const button = event.target.closest("button");
  if (!button) return;
  const { action, id } = button.dataset;
  const route = state.logistics.find((entry) => entry.id === id);
  if (!route) return;

  let flashClass = "status-neutral";
  if (action === "advance-route") {
    if (route.status === "scheduled") route.status = "in-transit";
    else if (route.status === "in-transit") route.status = "completed";
    flashClass = route.status === "completed" ? "status-approve" : "status-neutral";
  }

  if (action === "remove-route") {
    state.logistics = state.logistics.filter((entry) => entry.id !== id);
    flashClass = "status-reject";
  }

  saveState();
  renderLogistics();
  renderAnalytics();
  flashRow(logisticsTable, id, flashClass);
});

disputeFilter.addEventListener("change", renderDisputes);

disputeTable.addEventListener("click", (event) => {
  const button = event.target.closest("button");
  if (!button) return;
  const { action, id } = button.dataset;
  const dispute = state.disputes.find((entry) => entry.id === id);
  if (!dispute) return;

  let flashClass = "status-neutral";
  if (action === "resolve") dispute.status = "resolved";
  if (action === "resolve") flashClass = "status-approve";
  if (action === "remove-dispute") {
    state.disputes = state.disputes.filter((entry) => entry.id !== id);
    flashClass = "status-reject";
  }

  saveState();
  renderDisputes();
  renderAnalytics();
  flashRow(disputeTable, id, flashClass);
});

refreshAnalytics.addEventListener("click", renderAnalytics);

renderAll();
