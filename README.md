<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg" alt="Donate us"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow" alt="Follow us on Twitter"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

# 바둑 게임 서버 (Great Kingdom Server)

바둑과 유사한 형태의 게임을 위한 NestJS 기반 WebSocket 서버입니다. 이 프로젝트는 TypeScript로 작성되었으며, WebSocket 서버와 게임 로직을 모듈화하여 확장성 있는 구조로 설계되었습니다.

## 주요 기능

- WebSocket을 통한 실시간 게임 플레이
- 모듈화된 게임 로직과 WebSocket 서버
- 멀티플레이어 지원
- 게임 생성, 참여, 퇴장 기능
- 실시간 게임 상태 동기화

## 프로젝트 구조

```
src/
├── app.module.ts          # 앱 모듈
├── main.ts                # 서버 메인 파일
├── common/                # 공통 코드
│   ├── interfaces/        # 인터페이스 정의
│   └── models/            # 게임 모델 및 데이터 구조
├── game-logic/            # 게임 로직 모듈
│   ├── game-logic.module.ts
│   └── game/              # 게임 서비스
│       ├── game.service.ts
│       └── game.service.spec.ts
└── websocket/            # WebSocket 모듈
    ├── websocket.module.ts
    └── game/             # 게임 게이트웨이
        ├── game.gateway.ts
        └── game.gateway.spec.ts
```

## 설치 방법

```bash
# 패키지 설치
npm install

# 개발 모드로 실행
npm run start:dev

# 프로덕션 빌드
npm run build

# 프로덕션 모드로 실행
npm run start:prod
```

## WebSocket 이벤트

### 클라이언트에서 서버로

- `createGame`: 새 게임을 생성합니다
- `joinGame`: 기존 게임에 참여합니다
- `leaveGame`: 게임에서 나갑니다
- `makeMove`: 게임에서 돌을 놓습니다
- `getGameState`: 현재 게임 상태를 요청합니다

### 서버에서 클라이언트로

- `gameEvent`: 게임 이벤트를 브로드캐스트합니다 (JOIN, LEAVE, MOVE, GAME_OVER 등)
- `gameCreated`: 게임이 생성되었음을 알립니다
- `joinedGame`: 게임에 참여했음을 알립니다
- `leftGame`: 게임에서 나갔음을 알립니다
- `moveMade`: 돌을 놓았음을 알립니다
- `gameState`: 현재 게임 상태
- `error`: 오류 메시지

## 확장 가능성

- 다양한 게임 규칙 추가
- 사용자 인증 및 권한 관리
- 게임 히스토리 저장
- 랭킹 시스템
- 게임 관전 기능

## Description

[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.

## Project setup

```bash
$ npm install
```

## Compile and run the project

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Run tests

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Deployment

When you're ready to deploy your NestJS application to production, there are some key steps you can take to ensure it runs as efficiently as possible. Check out the [deployment documentation](https://docs.nestjs.com/deployment) for more information.

If you are looking for a cloud-based platform to deploy your NestJS application, check out [Mau](https://mau.nestjs.com), our official platform for deploying NestJS applications on AWS. Mau makes deployment straightforward and fast, requiring just a few simple steps:

```bash
$ npm install -g @nestjs/mau
$ mau deploy
```

With Mau, you can deploy your application in just a few clicks, allowing you to focus on building features rather than managing infrastructure.

## Resources

Check out a few resources that may come in handy when working with NestJS:

- Visit the [NestJS Documentation](https://docs.nestjs.com) to learn more about the framework.
- For questions and support, please visit our [Discord channel](https://discord.gg/G7Qnnhy).
- To dive deeper and get more hands-on experience, check out our official video [courses](https://courses.nestjs.com/).
- Deploy your application to AWS with the help of [NestJS Mau](https://mau.nestjs.com) in just a few clicks.
- Visualize your application graph and interact with the NestJS application in real-time using [NestJS Devtools](https://devtools.nestjs.com).
- Need help with your project (part-time to full-time)? Check out our official [enterprise support](https://enterprise.nestjs.com).
- To stay in the loop and get updates, follow us on [X](https://x.com/nestframework) and [LinkedIn](https://linkedin.com/company/nestjs).
- Looking for a job, or have a job to offer? Check out our official [Jobs board](https://jobs.nestjs.com).

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://twitter.com/kammysliwiec)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).
