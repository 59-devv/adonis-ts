import 'reflect-metadata';
import { join } from 'path';
import getPort from 'get-port';
import execa from 'execa';
import { configure } from 'japa';
import sourceMapSupport from 'source-map-support';

process.env.NODE_ENV = 'testing';
process.env.ADONIS_ACE_CWD = join(__dirname);
sourceMapSupport.install({ handleUncaughtExceptions: false });

// async function truncate() {
//     await User.truncate(true);
//     await Todo.truncate(true);
//     await Tag.truncate(true);
//     await TagTodo.truncate(true);
// };

async function runSeeder() {
    await execa.node('ace', ['db:seed'], {
        stdio: 'inherit',
    })
};

// Migration 시작 Function
async function runMigrations() {
    await execa.node('ace', ['migration:run'], {
        stdio: 'inherit',
    })
};

// Rollback Function
async function rollbackMigrations() {
    await execa.node('ace', ['migration:rollback', '--batch=0'], {
        stdio: 'inherit',
    })
};
async function startHttpServer() {
    const { Ignitor } = await import('@adonisjs/core/build/src/Ignitor')
    process.env.PORT = String(await getPort())
    await new Ignitor(__dirname).httpServer().start()
};

/**
 * Configure test runner
 */
configure({
    files: ['test/**/*.spec.ts'],
    before: [
        /* 현재 
           1. 테스트 시작 전에 DB Rollback
           2. DB Migration 진행 -> 테이블 생성
           3. Seeder 생성
        */
        rollbackMigrations,
        runMigrations,
        // truncate,
        runSeeder,
        startHttpServer,
    ],
    after: [],
});
