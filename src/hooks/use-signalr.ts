// src/hooks/useSignalR.ts
import { useState, useEffect, useCallback } from 'react';
import { signalRService } from '../services/signalR';
import { Notification } from '../services/types';
import { useAuth } from '../contexts/AuthContext';

export const useSignalR = () => {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const { user, isAuthenticated } = useAuth();

    const handleNotification = useCallback((newNotifications: Notification | Notification[]) => {
        setNotifications(prev => [
            ...(Array.isArray(newNotifications) ? newNotifications : [newNotifications]),
            ...prev
        ]);
    }, []);

    useEffect(() => {
        if (isAuthenticated && user) {
            const accessToken = localStorage.getItem('accessToken') || '';
            signalRService.startConnection(accessToken);
            signalRService.onNotification(handleNotification);

            return () => {
                signalRService.offNotification(handleNotification);
                signalRService.stopConnection();
            };
        }
    }, [isAuthenticated, user, handleNotification]);

    return { notifications };
};