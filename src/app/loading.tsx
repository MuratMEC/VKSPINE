"use client";

import { Box, Skeleton, Group, Stack } from '@mantine/core';

export default function Loading() {
    return (
        <Box p="md" w="100%">
            <Group justify="space-between" mb="lg">
                <Skeleton height={40} width={250} radius="md" />
                <Skeleton height={40} width={150} radius="md" />
            </Group>

            <Group grow mb="xl">
                <Skeleton height={120} radius="md" />
                <Skeleton height={120} radius="md" />
                <Skeleton height={120} radius="md" />
                <Skeleton height={120} radius="md" />
            </Group>

            <Stack gap="md">
                <Skeleton height={50} radius="md" />
                <Skeleton height={50} radius="md" />
                <Skeleton height={50} radius="md" />
                <Skeleton height={50} radius="md" />
                <Skeleton height={50} radius="md" />
            </Stack>
        </Box>
    );
}
