// 42 rotating daily questions — one cycles per day using day-of-year index.
// Covers the full Human Passport topic spectrum so no week feels repetitive.

export const DAILY_QUESTIONS: string[] = [
  "What truth did life teach you this week?",
  "What is one thing you stopped pretending was okay?",
  "What habit saved you when nothing else did?",
  "What do you wish someone had told you before you started over?",
  "What belief from your culture made you stronger?",
  "What does real success look like away from social media?",
  "How do you keep going when nobody sees you struggling?",
  "What is the bravest thing a quiet person can do?",
  "What did losing something teach you about what matters?",
  "What should every young person know before chasing money?",
  "What truth about love took you the longest to accept?",
  "What would you tell someone who feels completely invisible?",
  "How do you forgive someone who never said sorry?",
  "What is the kindest thing a stranger ever did for you?",
  "What discipline changed your relationship with money?",
  "How do you protect your peace when family brings chaos?",
  "What question do you wish someone would ask you?",
  "What do you do in the hour before you sleep that protects your mind?",
  "What does it mean to be a good neighbour in your community?",
  "What single choice turned your life in a better direction?",
  "How do you know when to stay and when to leave?",
  "What did failure teach you that success never could?",
  "What is something you know now that your younger self needed to hear?",
  "How do you stay rooted when everything around you is shifting?",
  "What does building wealth mean to a family like yours?",
  "What practice keeps your faith alive when it is hardest?",
  "How do you raise a child to be both strong and kind?",
  "What is the price of keeping the wrong secret too long?",
  "What does your community do better than anywhere else in the world?",
  "How do you repair trust once it has been broken?",
  "What is one thing people misunderstand about your country?",
  "What do you do when the person you love is in pain you cannot fix?",
  "What lesson from your grandparents still protects you today?",
  "How do you build something real when you start with almost nothing?",
  "What does home mean when you are far from where you were born?",
  "What is the most honest thing you have ever said to yourself?",
  "What would you do differently if nobody was watching?",
  "How do you help someone without taking their power away?",
  "What do you carry from your culture that you will never give up?",
  "What does a life well lived look like to you — not to anyone else?",
  "What is the first thing you do when you feel yourself slipping?",
  "How do you choose who deserves your trust?",
];

/** Returns today's daily question — changes at midnight, stable for the whole day. */
export function getDailyQuestion(): string {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const dayOfYear = Math.floor((now.getTime() - start.getTime()) / 86_400_000);
  return DAILY_QUESTIONS[dayOfYear % DAILY_QUESTIONS.length];
}
