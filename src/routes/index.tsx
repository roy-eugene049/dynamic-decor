import { createFileRoute } from '@tanstack/react-router'
import DynamicDecorApp from '../components/decor/DynamicDecorApp'

export const Route = createFileRoute('/')({ component: DynamicDecorApp })
