const TYPES = [
  'feat',
  'fix',
  'design',
  'hotfix',
  'style',
  'refactor',
  'comment',
  'docs',
  'test',
  'chore',
  'rename',
  'remove',
];

module.exports = {
  plugins: [
    {
      rules: {
        commit_message_pattern: ({ raw }) => {
          const messageType = raw.split(': ')[0];
          const checkResult = TYPES.includes(messageType);
          if (!checkResult) {
            return [
              false,
              '커밋 메시지는 지정된 타입: 내용 이어야 합니다. 타입명, :뒤에 공백 한칸을 체크해주세요',
            ];
          }
          return [true, ''];
        },
      },
    },
  ],
  rules: {
    commit_message_pattern: [2, 'always'],
    'subject-case': [
      2,
      'always',
      ['sentence-case', 'start-case', 'pascal-case', 'upper-case', 'lower-case'],
    ],
  },
};
