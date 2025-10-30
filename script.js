const state = {
  activeTab: "newsletter",
  clipboardTimer: null,
  pulseData: [],
};

const elements = {
  form: document.getElementById("briefForm"),
  topic: document.getElementById("topicInput"),
  updates: document.getElementById("updatesInput"),
  audience: document.getElementById("audienceInput"),
  brand: document.getElementById("brandInput"),
  format: document.getElementById("formatSelect"),
  tone: document.getElementById("toneSelect"),
  depth: document.getElementById("depthRange"),
  callouts: document.getElementById("calloutsInput"),
  cta: document.getElementById("ctaInput"),
  generate: document.getElementById("generateBtn"),
  clear: document.getElementById("clearFieldsBtn"),
  copy: document.getElementById("copyAllBtn"),
  refreshPulse: document.getElementById("refreshPulseBtn"),
  tabs: document.querySelectorAll(".tab"),
  views: {
    newsletter: document.getElementById("newsletterView"),
    blog: document.getElementById("blogView"),
    social: document.getElementById("socialView"),
  },
  pulseList: document.getElementById("pulseList"),
  pulseTemplate: document.getElementById("pulseItemTemplate"),
};

const toneDescriptors = {
  upbeat: ["energizing", "momentum-driven", "forward-looking"],
  analytical: ["data-backed", "measured", "insight-heavy"],
  authoritative: ["decisive", "directive", "confident"],
  conversational: ["relatable", "approachable", "human"],
  playful: ["inventive", "light-hearted", "creative"],
};

const cadenceDescriptors = [
  "Weekly Pulse",
  "Bi-weekly Digest",
  "Monthly Deep Dive",
  "Launch Spotlight",
  "Executive Brief",
];

const formatTaglines = {
  newsletter: [
    "A curated signal for leaders tracking what's next.",
    "Your front-row seat to emerging shifts worth sharing.",
    "The briefing to keep your community primed and inspired.",
  ],
  blog: [
    "A field guide to navigate the changes reshaping the market.",
    "Breaking down the latest wave so builders can act fast.",
    "Translating fresh signals into practical playbooks.",
  ],
  "thought-leadership": [
    "A strategic lens to position you ahead of the curve.",
    "Provocative thinking for exec teams eyeing the next leap.",
    "Framing change so your leadership narrative lands first.",
  ],
};

const trendLibrary = [
  {
    tags: ["ai", "artificial intelligence", "generative", "automation"],
    title: "Generative AI shifts from pilots to owned IP",
    description:
      "Teams are pushing beyond text-to-image demos into proprietary copilots that fold brand tone and compliance into production workflows.",
  },
  {
    tags: ["marketing", "growth", "brand"],
    title: "Performance and brand marketing finally align",
    description:
      "Leaderboards now reward full-funnel storytelling, not just CPC deltas. Expect smarter narrative arcs and fewer siloed KPIs.",
  },
  {
    tags: ["data", "privacy", "security"],
    title: "Zero-party data becomes the new personalization currency",
    description:
      "High-signal surveys and community forums are replacing invasive tracking scripts, tightening the trust loop with subscribers.",
  },
  {
    tags: ["climate", "energy", "sustainability"],
    title: "Sustainability KPIs anchor quarterly reporting",
    description:
      "Companies responding to Scope 3 scrutiny are publishing climate scorecards that double as investor and customer comms assets.",
  },
  {
    tags: ["fintech", "payments", "crypto", "defi"],
    title: "Embedded finance launches get pragmatic",
    description:
      "Roadmaps prioritize sticky treasury use-cases over splashy cards, focusing on cash management and real-time settlement.",
  },
  {
    tags: ["productivity", "workflow", "ops"],
    title: "Ops teams double down on connected work surfaces",
    description:
      "Executors are stitching whiteboards, docs, and automations into a single ritual to keep hybrid teams business-ready.",
  },
];

const insightAngles = [
  ({ audience }) =>
    `What your ${audience || "core audience"} needs to know now`,
  ({ brand }) =>
    brand
      ? `How ${brand} can steer the response`
      : "Where smart operators are already adapting",
  ({ tone }) =>
    `Recommended voice: ${
      toneDescriptors[tone]?.join(", ") || "clear and focused"
    }`,
];

const callToActionSuggestions = [
  "Invite readers to a live session unpacking the findings",
  "Point toward a tactical checklist or worksheet",
  "Offer an exclusive product walkthrough slot",
  "Broaden the conversation with a community poll",
];

function getRandomItem(list) {
  return list[Math.floor(Math.random() * list.length)];
}

function parseList(input = "") {
  return input
    .split(/\n|,|;/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function inferToneLead(tone) {
  switch (tone) {
    case "upbeat":
      return "We're tracking momentum you can activate today.";
    case "analytical":
      return "Here's the signal beneath the noise.";
    case "authoritative":
      return "Consider this your directive on what matters next.";
    case "conversational":
      return "Let's break down what caught our eye this week.";
    case "playful":
      return "Future-forward heads-up, with a wink.";
    default:
      return "Here's what operators should know right now.";
  }
}

function pickTrends(topic, updates) {
  const text = `${topic} ${updates}`.toLowerCase();
  const matched = trendLibrary.filter((item) =>
    item.tags.some((tag) => text.includes(tag))
  );
  return matched.length ? matched : trendLibrary.slice(0, 3);
}

function buildInsights(context) {
  const { topic, updates } = context;
  const trends = pickTrends(topic, updates);
  const now = new Date();
  const stamp = now.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });

  return trends.map((trend) => ({
    headline: trend.title,
    meta: `${stamp} · ${getRandomItem(cadenceDescriptors)}`,
    description: trend.description,
  }));
}

function renderPulseList(items) {
  elements.pulseList.innerHTML = "";
  items.forEach((item) => {
    const node = elements.pulseTemplate.content.firstElementChild.cloneNode(
      true
    );
    node.querySelector(".insight-title").textContent = item.headline;
    node.querySelector(".insight-meta").textContent = item.meta;
    node.dataset.description = item.description;

    node.querySelector(".mini-btn").addEventListener("click", () => {
      const current = elements.updates.value.trim();
      const appended = current ? `${current}\n${item.headline}` : item.headline;
      elements.updates.value = appended;
      elements.updates.focus();
    });

    elements.pulseList.appendChild(node);
  });
}

function formatBulletList(items) {
  return items.map((item) => `• ${item}`).join("\n");
}

function carveSections({ paragraphs, depth }) {
  const sectionCount = Math.min(4, Math.max(2, depth));
  const chunkSize = Math.ceil(paragraphs.length / sectionCount);
  const sections = [];
  for (let i = 0; i < sectionCount; i += 1) {
    const slice = paragraphs.slice(i * chunkSize, (i + 1) * chunkSize);
    if (slice.length) {
      sections.push(slice.join(" "));
    }
  }
  return sections;
}

function outlineNarrative(context) {
  const updates = parseList(context.updates).slice(0, 6);
  const callouts = parseList(context.callouts);
  const baseParagraphs = [
    `${inferToneLead(context.tone)} ${context.topic
      ? `The focus: ${context.topic}.`
      : ""}`,
    updates.length
      ? `Fresh signals we're tracking: ${updates
          .map((point) => point.replace(/^[•-]\s*/, ""))
          .join("; ")}.`
      : "We surface emerging shifts that deserve attention.",
    context.audience
      ? `Why ${context.audience} should care: the next quarter will favor teams who anticipate these shifts before they dominate the roadmap.`
      : "This matters for teams that want to move faster than consensus.",
    context.brand
      ? `Position ${context.brand} as the guide: show how you absorb the complexity and return clarity-level insights, backed by proof points.`
      : "Anchor your perspective in proof, not hype—operators want applied, not abstract.",
    callouts.length
      ? `Must-share callouts: ${callouts.join(", ")}. Weave them into the narrative as evidence or next steps.`
      : "Layer in a tangible datapoint or customer vignette so readers stay grounded.",
    context.cta
      ? `Close with: ${context.cta}. Keep the ask crisp and tied to an outcome.`
      : `Wrap with a crisp CTA—${getRandomItem(callToActionSuggestions)}.`,
  ];

  const depthInt = parseInt(context.depth, 10) || 3;
  if (depthInt > 3) {
    baseParagraphs.push(
      "Signal boost: include a sidebar highlighting the most contrarian take you heard this week. Invite feedback to keep the loop fresh.",
      "Add a 'What we’re watching next' block listing 2 forward-looking bets. Investors and execs love controlled speculation."
    );
  } else if (depthInt < 3) {
    baseParagraphs.push(
      "Keep it lightweight: aim for 2 paragraphs and a bulleted action list. Highlight the one move readers should try immediately."
    );
  }

  return carveSections({ paragraphs: baseParagraphs, depth: depthInt });
}

function buildNewsletterDraft(context) {
  const sections = outlineNarrative(context);
  const insights = insightAngles.map((angle) => angle(context));
  const highlight = getRandomItem(context.pulseData);

  const hero =
    highlight?.headline ||
    `Fresh signals on ${context.topic || "the shift shaping your roadmap"}`;

  return [
    `📰 ${context.topic || "Latest Signal"} — ${inferToneLead(
      context.tone
    )}`,
    "",
    `📌 Spotlight: ${hero}`,
    highlight ? `${highlight.description}\n` : "",
    "Key Angles:",
    formatBulletList(insights),
    "",
    "Narrative:",
    sections.join("\n\n"),
    "",
    "Next Actions:",
    formatBulletList([
      "Share with your leadership channel and flag the most urgent response.",
      "Clip a visual or chart that reinforces the main insight.",
      context.cta || getRandomItem(callToActionSuggestions),
    ]),
  ].join("\n");
}

function buildBlogDraft(context) {
  const sections = outlineNarrative(context);
  const intro = sections.shift();
  const headline =
    context.topic ||
    "The emerging shift every operator should be preparing for";

  const subheads = [
    "Why this matters now",
    "Signals worth amplifying",
    "How to activate fast",
    "Looking ahead",
  ];

  const body = sections.map((paragraph, idx) => {
    const title = subheads[idx] || `Angle ${idx + 1}`;
    return `### ${title}\n${paragraph}`;
  });

  return [
    `# ${headline}`,
    "",
    `${inferToneLead(context.tone)} ${intro}`,
    "",
    ...body,
    "",
    "### CTA",
    context.cta ||
      "Invite readers to weigh in with their own signal or join an upcoming briefing.",
  ].join("\n");
}

function buildSocialTeasers(context) {
  const callouts = parseList(context.callouts);
  const updates = parseList(context.updates);
  const hook = context.topic
    ? `The latest on ${context.topic.toLowerCase()}`
    : "Latest signal worth shipping ASAP";

  const socialSnippets = [
    `${hook} 👀\n${inferToneLead(context.tone)}\n${updates
      .slice(0, 2)
      .map((item) => `• ${item}`)
      .join("\n")}\n→ ${context.cta || "Reply if you want the full breakdown."}`,
    `Leaders tracking ${context.topic || "the next wave"}:\n${
      callouts[0] || "Here’s the unlock nobody is talking about."
    }\nFull story drops in the newsletter.`,
    `Newsletter teaser: ${hook}\nWhy it matters for ${
      context.audience || "operators"
    }: ${
      callouts[1] || "You can move first while the market catches up."
    }\n${context.cta || "Grab a seat for the briefing."}`,
  ];

  return socialSnippets.join("\n\n");
}

function collectContext() {
  return {
    topic: elements.topic.value.trim(),
    updates: elements.updates.value.trim(),
    audience: elements.audience.value.trim(),
    brand: elements.brand.value.trim(),
    format: elements.format.value,
    tone: elements.tone.value,
    depth: elements.depth.value,
    callouts: elements.callouts.value.trim(),
    cta: elements.cta.value.trim(),
    pulseData: state.pulseData,
  };
}

function renderOutputs(context) {
  const newsletter = buildNewsletterDraft(context);
  const blog = buildBlogDraft(context);
  const social = buildSocialTeasers(context);

  elements.views.newsletter.textContent = newsletter;
  elements.views.blog.textContent = blog;
  elements.views.social.textContent = social;
}

function handleGenerate() {
  if (!elements.topic.value.trim()) {
    elements.topic.focus();
    elements.topic.classList.add("invalid");
    setTimeout(() => elements.topic.classList.remove("invalid"), 1500);
    return;
  }

  const context = collectContext();
  state.pulseData = buildInsights(context);
  renderPulseList(state.pulseData);
  renderOutputs({ ...context, pulseData: state.pulseData });
}

function handleClear() {
  elements.form.reset();
  state.pulseData = [];
  elements.pulseList.innerHTML = "";
  Object.values(elements.views).forEach((view) => {
    view.textContent = "Draft preview will appear here after you generate.";
  });
}

function setActiveTab(target) {
  state.activeTab = target;
  elements.tabs.forEach((tab) => {
    const isActive = tab.dataset.target === target;
    tab.classList.toggle("active", isActive);
  });

  Object.entries(elements.views).forEach(([id, node]) => {
    node.classList.toggle("active", id === target);
  });
}

function initTabs() {
  elements.tabs.forEach((tab) => {
    tab.addEventListener("click", () => setActiveTab(tab.dataset.target));
  });
}

function copyAll() {
  const combined = [
    "==== Newsletter Draft ====",
    elements.views.newsletter.textContent,
    "",
    "==== Blog Draft ====",
    elements.views.blog.textContent,
    "",
    "==== Social Teasers ====",
    elements.views.social.textContent,
  ].join("\n");

  navigator.clipboard
    .writeText(combined)
    .then(() => {
      elements.copy.textContent = "Copied!";
      clearTimeout(state.clipboardTimer);
      state.clipboardTimer = setTimeout(() => {
        elements.copy.textContent = "Copy All";
      }, 2200);
    })
    .catch(() => {
      elements.copy.textContent = "Clipboard blocked";
      setTimeout(() => {
        elements.copy.textContent = "Copy All";
      }, 2500);
    });
}

function refreshPulse() {
  const context = collectContext();
  state.pulseData = buildInsights(context);
  renderPulseList(state.pulseData);
}

function bootstrap() {
  initTabs();
  elements.generate.addEventListener("click", handleGenerate);
  elements.clear.addEventListener("click", handleClear);
  elements.copy.addEventListener("click", copyAll);
  elements.refreshPulse.addEventListener("click", refreshPulse);

  // Generate placeholder view on load
  Object.values(elements.views).forEach((view) => {
    view.textContent = "Draft preview will appear here after you generate.";
  });

  // Seed insights immediately so users have inspiration
  refreshPulse();
}

bootstrap();

