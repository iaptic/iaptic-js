import { IapticStripe } from './iaptic-stripe';
import { Purchase } from './types';

/**
 * Represents a scheduled refresh for a subscription
 */
export interface ScheduledRefresh {
    /** Unique identifier for the scheduled refresh */
    id: string;
    /** Unique identifier for the subscription */
    subscriptionId: string;
    /** Date and time of the scheduled refresh */
    scheduledAt: number;
    /** Whether the refresh has been completed */
    completed: boolean;
    /** Whether the refresh is currently in progress */
    inProgress: boolean;
    /** Reason for the scheduled refresh */
    reason: string;
}

export class RefreshScheduler {
    schedules: ScheduledRefresh[] = [];
    private iapticStripe: IapticStripe;

    constructor(iapticStripe: IapticStripe) {
        this.iapticStripe = iapticStripe;
    }

    private setTimeout(schedule: ScheduledRefresh): void {
        const delay = schedule.scheduledAt - Date.now();
        // console.log(`Scheduling refresh for ${schedule.subscriptionId} (${schedule.reason}) in ${delay}ms`);
        if (delay <= 0) return; 
        const SET_TIMEOUT_MAX_DELAY = 2147483647;
        if (delay > SET_TIMEOUT_MAX_DELAY) {
            // console.log(`Scheduled refresh for ${schedule.subscriptionId} (${schedule.reason}) is too far in the future: ${delay}ms`);
            return;
        }

        setTimeout(async () => {
            if (schedule.completed) return;
            if (schedule.scheduledAt - 10000 > Date.now()) return; // something went wrong
            // console.log(`Running refresh for ${schedule.subscriptionId} (${schedule.reason})`);
            
            const inProgressRefresh = this.schedules.find(s => 
                s.subscriptionId === schedule.subscriptionId && s.inProgress
            );
            if (inProgressRefresh) {
                console.log(`Skipping refresh for ${schedule.subscriptionId} (${schedule.reason}): another refresh in progress`);
                return;
            }

            try {
                console.log(`Refreshing subscription ${schedule.subscriptionId} (${schedule.reason})`);
                schedule.inProgress = true;
                await this.iapticStripe.getPurchases();
                schedule.completed = true;
            } catch (error) {
                console.error('Error refreshing subscription:', error);
                
                if (!schedule.reason.startsWith('retry-')) {
                    const retryDate = new Date(Date.now() + 30000);
                    this.scheduleRefresh(
                        schedule.subscriptionId,
                        retryDate,
                        `retry-${schedule.reason}`
                    );
                }
            } finally {
                schedule.inProgress = false;
            }
        }, delay);
    }

    scheduleRefresh(subscriptionId: string, date: Date, reason: string): void {
        const schedule: ScheduledRefresh = {
            id: `${subscriptionId}-${date.getTime()}`,
            subscriptionId,
            scheduledAt: date.getTime(),
            completed: false,
            inProgress: false,
            reason
        };

        if (this.schedules.some(s => s.id === schedule.id)) {
            return;
        }

        this.schedules.push(schedule);
        this.setTimeout(schedule);
    }

    schedulePurchaseRefreshes(purchase: Purchase): void {
        if (!purchase.expirationDate) {
            return;
        }
        const expirationDate = new Date(purchase.expirationDate);
        // console.log(`Subscription ${purchase.purchaseId} expiration date: ${expirationDate.toISOString()}`);
        const beforeExpiration = new Date(expirationDate.getTime() - 10000);
        const afterExpiration = new Date(expirationDate.getTime() + 10000);

        const dates: { date: Date, reason: string }[] = [];
        dates.push({ date: beforeExpiration, reason: 'pre-expiration' });
        dates.push({ date: afterExpiration, reason: 'post-expiration' });

        dates.forEach(({ date, reason }) => {
            if (date.getTime() > Date.now()) {
                this.scheduleRefresh(purchase.purchaseId, date, reason);
            }
        });
    }

    clearSchedules(): void {
        this.schedules = [];
    }
} 