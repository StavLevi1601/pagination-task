const cors = require("cors");
const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const port = 3000;

app.use(bodyParser.json());
app.use(cors());
let rules = [];
let nextId = 1;

// Rule structure:
// {
//   id: number,
//   ipStart: string,
//   ipEnd: string,
//   portStart: number,
//   portEnd: number,
//   action: 'allow' | 'block'
// }

// Helper function to check if an IP is within a range
function isIpInRange(ip, start, end) {
  const ipNum = ip
    .split(".")
    .reduce((acc, octet) => acc * 256 + parseInt(octet), 0);
  const startNum = start
    .split(".")
    .reduce((acc, octet) => acc * 256 + parseInt(octet), 0);
  const endNum = end
    .split(".")
    .reduce((acc, octet) => acc * 256 + parseInt(octet), 0);
  return ipNum >= startNum && ipNum <= endNum;
}

// Pre-populate 100 rules
function populateRules() {
  for (let i = 0; i < 100; i++) {
    const rule = {
      id: nextId++,
      ipStart:
        Math.floor(Math.random() * 256) +
        "." +
        Math.floor(Math.random() * 256) +
        "." +
        Math.floor(Math.random() * 256) +
        "." +
        Math.floor(Math.random() * 256),
      ipEnd:
        Math.floor(Math.random() * 256) +
        "." +
        Math.floor(Math.random() * 256) +
        "." +
        Math.floor(Math.random() * 256) +
        "." +
        Math.floor(Math.random() * 256),
      portStart: Math.floor(Math.random() * 65535),
      portEnd: Math.floor(Math.random() * 65535),
      action: Math.random() < 0.5 ? "allow" : "block",
    };
    rules.push(rule);
  }
}

populateRules();

// Search for a rule
app.get("/search", (req, res) => {
  const { ip, port } = req.query;
  if (!ip || !port) {
    return res.status(400).json({ error: "IP and port are required" });
  }

  const matchingRule = rules.find(
    (rule) =>
      isIpInRange(ip, rule.ipStart, rule.ipEnd) &&
      parseInt(port) >= rule.portStart &&
      parseInt(port) <= rule.portEnd
  );

  if (matchingRule) {
    res.json({ action: matchingRule.action });
  } else {
    res.json({ action: "allow" }); // Default action if no rule matches
  }
});

// Add a new rule
app.post("/rules", (req, res) => {
  const { ipStart, ipEnd, portStart, portEnd, action } = req.body;
  if (!ipStart || !ipEnd || !portStart || !portEnd || !action) {
    return res.status(400).json({ error: "All fields are required" });
  }

  const newRule = {
    id: nextId++,
    ipStart,
    ipEnd,
    portStart: parseInt(portStart),
    portEnd: parseInt(portEnd),
    action,
  };

  rules.push(newRule);
  res.status(201).json(newRule);
});

// Update a rule
app.put("/rules/:id", (req, res) => {
  const id = parseInt(req.params.id);
  const { ipStart, ipEnd, portStart, portEnd, action } = req.body;

  const ruleIndex = rules.findIndex((rule) => rule.id === id);
  if (ruleIndex === -1) {
    return res.status(404).json({ error: "Rule not found" });
  }

  rules[ruleIndex] = {
    ...rules[ruleIndex],
    ipStart: ipStart || rules[ruleIndex].ipStart,
    ipEnd: ipEnd || rules[ruleIndex].ipEnd,
    portStart: portStart ? parseInt(portStart) : rules[ruleIndex].portStart,
    portEnd: portEnd ? parseInt(portEnd) : rules[ruleIndex].portEnd,
    action: action || rules[ruleIndex].action,
  };

  res.json(rules[ruleIndex]);
});

// Get a specific rule
app.get("/rules/:id", (req, res) => {
  const id = parseInt(req.params.id);
  const rule = rules.find((rule) => rule.id === id);

  if (rule) {
    res.json(rule);
  } else {
    res.status(404).json({ error: "Rule not found" });
  }
});

// Delete a rule
app.delete("/rules/:id", (req, res) => {
  const id = parseInt(req.params.id);
  const ruleIndex = rules.findIndex((rule) => rule.id === id);

  if (ruleIndex !== -1) {
    rules.splice(ruleIndex, 1);
    res.status(204).send();
  } else {
    res.status(404).json({ error: "Rule not found" });
  }
});

// List rules (paginated)
app.get("/rules", (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;

  const paginatedRules = rules.slice(startIndex, endIndex);

  res.json({
    currentPage: page,
    totalPages: Math.ceil(rules.length / limit),
    totalRules: rules.length,
    rules: paginatedRules,
  });
});

app.listen(port, () => {
  console.log(`Firewall rules server listening at http://localhost:${port}`);
});
