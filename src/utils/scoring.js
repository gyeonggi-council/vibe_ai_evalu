export function calcScores(answers) {
  const scores = {
    basic:   answers.q1 + answers.q2 + answers.q3,    // 질문형 (최대 9)
    utilize: answers.q4 + answers.q5 + answers.q6,    // 활용형 (최대 9)
    build:   answers.q7 + answers.q8 + answers.q9,    // 구현형 (최대 9)
    extend:  answers.q10 + answers.q11 + answers.q12, // 확장형 (최대 9)
    operate: answers.q13 + answers.q14 + answers.q15, // 운영형 (최대 9)
  };
  scores.total = scores.basic + scores.utilize + scores.build + scores.extend + scores.operate;
  return scores;
}

export function determineType(scores, answers) {
  // 운영형 — 지휘관
  if (
    scores.total >= 37 &&
    scores.operate >= 6 &&
    (answers.q14 >= 2 || answers.q15 >= 2)
  ) return 'operator';

  // 확장형 — 개척자
  if (
    scores.total >= 28 &&
    scores.extend >= 5 &&
    (answers.q10 >= 2 || answers.q11 >= 2)
  ) return 'extender';

  // 구현형 — 제작자
  if (
    scores.total >= 19 &&
    scores.build >= 5 &&
    (answers.q7 >= 2 || answers.q9 >= 2)
  ) return 'builder';

  // 활용형 — 조련사
  if (
    scores.total >= 11 &&
    (scores.basic + scores.utilize) >= 6 &&
    (answers.q4 >= 2 || answers.q6 >= 2)
  ) return 'utilizer';

  // 질문형 — 초심자 (기본)
  return 'beginner';
}

export function calcQuizScore(quizAnswers, quizQuestions) {
  let correct = 0;
  quizQuestions.forEach((q) => {
    if (quizAnswers[`q${q.id}`] === q.answer) {
      correct++;
    }
  });
  return correct;
}

export function generateShareCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export const TYPE_META = {
  beginner: {
    label: '질문형 — 초심자',
    emoji: '\u{1F331}',
    image: '/images/beginner.jpg',
    color: '#3B82F6',
    description: '생성형 AI에게 묻고 답을 얻으며 활용의 첫걸음을 시작하는 단계입니다.',
    path: '생성형 AI 입문 교육 → 문서 요약·초안 작성 실습 → 프롬프트 기초 훈련',
    nextActions: [
      'ChatGPT·Claude 등 생성형 AI 서비스 매일 업무에 1회 이상 사용해보기',
      'AI 결과물은 반드시 사실관계를 직접 확인 후 활용하는 습관 만들기',
      '부서 내 AI 활용 사례 수집 및 따라하기',
    ]
  },
  utilizer: {
    label: '활용형 — 조련사',
    emoji: '\u{1F3AF}',
    image: '/images/utilizer.jpg',
    color: '#10B981',
    description: 'AI를 원하는 방향으로 다루며 결과물의 품질을 높이는 단계입니다.',
    path: '프롬프트 설계 심화 → 업무용 템플릿 제작 → 팀 단위 AI 활용 표준화',
    nextActions: [
      '자주 쓰는 업무 유형별 프롬프트 템플릿 3개 이상 만들어 저장하기',
      'AI 결과물의 논리 구조를 직접 재구성하여 최종 산출물 완성해보기',
      '팀원에게 AI 활용 방법 1가지 공유해보기',
    ]
  },
  builder: {
    label: '구현형 — 제작자',
    emoji: '\u{1F528}',
    image: '/images/builder.jpg',
    color: '#8B5CF6',
    description: '바이브 코딩으로 실제 작동하는 업무 도구를 만들어내는 단계입니다.',
    path: '바이브 코딩 실습 → 미니 웹앱·업무 보조 도구 제작 → 팀 프로젝트 참여',
    nextActions: [
      'Bolt, Lovable 등 바이브 코딩 도구로 업무 보조 폼 1개 만들어보기',
      'AI가 만든 코드의 오류를 직접 설명하고 수정 요청하는 경험 쌓기',
      '팀 내 반복 업무 1가지를 자동화하는 도구 제작 프로젝트 시작하기',
    ]
  },
  extender: {
    label: '확장형 — 개척자',
    emoji: '\u{1F680}',
    image: '/images/extender.jpg',
    color: '#F59E0B',
    description: '만든 결과물을 배포·연결·확장해 실사용으로 이어가는 단계입니다.',
    path: 'Vercel·Netlify 배포 실습 → DB·API 연동 → 실사용 가능 서비스 확장',
    nextActions: [
      '만든 도구를 Netlify 또는 Vercel에 배포하여 동료와 링크 공유하기',
      'Supabase 또는 Google Sheets 연동으로 데이터 누적 저장 기능 추가하기',
      '외부 API 1개 연동하여 실제 데이터를 불러오는 기능 구현해보기',
    ]
  },
  operator: {
    label: '운영형 — 지휘관',
    emoji: '\u{2699}\u{FE0F}',
    image: '/images/operator.jpg',
    color: '#EF4444',
    description: 'CLI, AI 에이전트, 버전 관리를 운영하며 자동화와 협업을 이끄는 단계입니다.',
    path: 'Claude Code·Codex CLI 운영 → Git 기반 협업 → 자동화 흐름 설계 및 팀 멘토링',
    nextActions: [
      'Claude Code CLI로 실제 업무 자동화 시나리오 1개 구성해보기',
      'Git 저장소로 팀 프로젝트 버전 관리 체계 만들어 운영하기',
      '팀 내 구현형·확장형 동료의 프로젝트 멘토 역할 맡아보기',
    ]
  },
};
