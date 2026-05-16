"use client";

import { usePathname } from 'next/navigation';
import { AppShell, Burger, Group, Title, ActionIcon, Box } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { Activity } from 'lucide-react';
import Link from 'next/link';
import Sidebar from './Sidebar';
import Header from './Header';
import { useState } from 'react';

export default function AppLayoutWrapper({ children }: { children: React.ReactNode }) {
    const [mobileOpened, { toggle: toggleMobile }] = useDisclosure();
    const [desktopOpened, { toggle: toggleDesktop }] = useDisclosure(true);
    const pathname = usePathname();

    const isLoginPage = pathname === '/login';

    if (isLoginPage) {
        return <main className="flex-1 overflow-y-auto">{children}</main>;
    }

    return (
        <AppShell
            header={{ height: 64 }}
            navbar={{
                width: desktopOpened ? 260 : 70,
                breakpoint: 'sm',
                collapsed: { mobile: !mobileOpened },
            }}
            padding="md"
            transitionDuration={200}
            transitionTimingFunction="ease"
            bg="#F8F9FA"
        >
            <AppShell.Header>
                <Group h="100%" px="md" justify="space-between" wrap="nowrap">
                    <Group wrap="nowrap">
                        <Burger opened={mobileOpened} onClick={toggleMobile} hiddenFrom="sm" size="sm" />
                        <Link href="/" style={{ textDecoration: 'none' }}>
                            <Group wrap="nowrap" gap="xs">
                                <ActionIcon variant="gradient" gradient={{ from: 'blue', to: 'indigo', deg: 90 }} size="lg" radius="md">
                                    <Activity size={20} />
                                </ActionIcon>
                                <Title order={3} display={{ base: 'none', xs: 'block' }} style={{ background: 'linear-gradient(90deg, #1d4ed8, #4338ca)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                                    MediStock
                                </Title>
                            </Group>
                        </Link>
                    </Group>

                    <Box style={{ flex: 1 }}>
                        <Header />
                    </Box>
                </Group>
            </AppShell.Header>

            <AppShell.Navbar p={0} style={{ borderRight: '1px solid #E9ECEF', overflow: 'hidden' }}>
                <Sidebar isOpen={desktopOpened} toggleDesktop={toggleDesktop} />
            </AppShell.Navbar>

            <AppShell.Main>
                {children}
            </AppShell.Main>
        </AppShell>
    );
}
