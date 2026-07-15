const DEMO_ANSWERS = {
  vision:
    "My strongest computer vision experience comes from PT Petrokimia Gresik and AROC_PL. At AROC_PL, I lead eight members developing real-time vision for humanoid robot soccer, and pipeline optimization improved object detection and image processing accuracy by up to 70%. At Petrokimia, I collaborate with researchers on industrial computer vision requirements.",
  product:
    "Yes. At CV LetConnect Canada, I designed LLM architecture and inference pipelines for mobile and web applications, and supported AI-powered features launched on both the Apple App Store and Google Play Store. I also presented product demonstrations that contributed to collaborations with three foundation partners.",
  hire:
    "I bring a useful combination of applied AI engineering, product awareness, and leadership. I have worked on industrial computer vision, shipped LLM-powered product features, led an eight-person robotics division, and contributed to accessibility-focused projects. I am still early in my career, but I already know how to learn inside real constraints and communicate technical work clearly.",
  projects:
    "LLMForAutism best represents how I approach meaningful problems. I developed the specialized LLM-based system with Malang Autism Center to support children with verbal autism. The project connects technical implementation with direct community context, and it is planned for an official launch and intellectual property registration by the center.",
  default:
    "I am an Informatics Engineering student focused on practical AI systems across industry, accessibility, and robotics. My experience includes computer vision at PT Petrokimia Gresik, LLM product work at CV LetConnect Canada, and image processing leadership at AROC_PL. Ask me about any of those areas and I will connect the answer to verified evidence.",
};

export function getDemoAnswer(message) {
  const normalized = message.toLowerCase();
  if (/computer vision|image processing|robot/.test(normalized)) return DEMO_ANSWERS.vision;
  if (/ship|product|app store|play store|llm/.test(normalized)) return DEMO_ANSWERS.product;
  if (/hire|fit|team|intern/.test(normalized)) return DEMO_ANSWERS.hire;
  if (/project|autism|meaningful|strongest/.test(normalized)) return DEMO_ANSWERS.projects;
  return DEMO_ANSWERS.default;
}

export async function streamDemoAnswer(res, message, writeSse) {
  const words = getDemoAnswer(message).split(/(\s+)/);
  for (let index = 0; index < words.length; index += 1) {
    writeSse(res, "delta", { text: words[index] });
    if (index % 5 === 0) await new Promise((resolve) => setTimeout(resolve, 24));
  }
  writeSse(res, "done", { finishReason: "stop", mode: "demo" });
}
