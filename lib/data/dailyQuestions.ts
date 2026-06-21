// 63 rotating daily questions — one cycles per day using day-of-year index.
// Covers the full Human Passport topic spectrum so no nine weeks feel repetitive.

export const DAILY_QUESTIONS: string[] = [
  // Life & Growth
  "What truth did life teach you this week?",
  "What is one thing you stopped pretending was okay?",
  "What habit saved you when nothing else did?",
  "What do you wish someone had told you before you started over?",
  "What belief from your culture made you stronger?",
  "What does real success look like away from social media?",
  "How do you keep going when nobody sees you struggling?",
  "What is the bravest thing a quiet person can do?",
  "What did losing something teach you about what matters?",
  "What single choice turned your life in a better direction?",
  "How do you know when to stay and when to leave?",
  "What did failure teach you that success never could?",
  "What is something you know now that your younger self needed to hear?",
  "How do you stay rooted when everything around you is shifting?",
  "What is the most honest thing you have ever said to yourself?",
  "What would you do differently if nobody was watching?",
  "What is the first thing you do when you feel yourself slipping?",
  "What version of yourself are you becoming, and is that who you want to be?",
  "What is one thing you have done that fear tried to stop?",
  "What moment proved to you that ordinary people can do extraordinary things?",
  // Money & Work
  "What should every young person know before chasing money?",
  "What discipline changed your relationship with money?",
  "What does building wealth mean to a family like yours?",
  "How do you build something real when you start with almost nothing?",
  "What did your first paying job teach you that no school could?",
  "What separates people who get paid well from people who do not?",
  "What financial mistake taught you the most lasting lesson?",
  "What would you do with six months and no income pressure?",
  // Love, Family & Community
  "What truth about love took you the longest to accept?",
  "How do you forgive someone who never said sorry?",
  "What is the price of keeping the wrong secret too long?",
  "How do you repair trust once it has been broken?",
  "What do you do when the person you love is in pain you cannot fix?",
  "How do you raise a child to be both strong and kind?",
  "How do you protect your peace when family brings chaos?",
  "What does your community do better than anywhere else in the world?",
  "What does it mean to be a good neighbour in your community?",
  "How do you help someone without taking their power away?",
  "What is the kindest thing a stranger ever did for you, and did you pass it on?",
  "What do you carry from your culture that you will never give up?",
  // Identity & Culture
  "What is one thing people misunderstand about your country?",
  "What does home mean when you are far from where you were born?",
  "What question do you wish someone would ask you?",
  "What would you tell someone who feels completely invisible?",
  "What practice keeps your faith alive when it is hardest?",
  "What lesson from your grandparents still protects you today?",
  "What does your language carry that cannot be translated?",
  "What part of your culture do you want the next generation to hold onto?",
  "What does dignity mean to you when life has stripped most things away?",
  // Mind & Purpose
  "What do you do in the hour before you sleep that protects your mind?",
  "What does a life well lived look like to you — not to anyone else?",
  "How do you choose who deserves your trust?",
  "What is something you stopped doing that made your life quieter and better?",
  "What would you change about how the world treats people who look like you?",
  "What does rest mean to someone who grew up watching people work without stopping?",
  "What gives you energy even when nothing is rewarding you for it?",
  "How do you stay motivated when your progress is invisible?",
  "What is the difference between being busy and building something that matters?",
  // Reflection & Gratitude
  "What small thing went right today that you almost did not notice?",
  "Who shaped who you are without knowing it?",
  "What is a memory you return to when you need to remember you are capable?",
  "What truth about yourself did someone else see before you did?",
  "What does it mean to live with integrity in the place where you actually live?",
];

/** Returns today's daily question — changes at midnight, stable for the whole day. */
export function getDailyQuestion(): string {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const dayOfYear = Math.floor((now.getTime() - start.getTime()) / 86_400_000);
  return DAILY_QUESTIONS[dayOfYear % DAILY_QUESTIONS.length];
}
