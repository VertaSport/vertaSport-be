import User from '@/models/User';

import { Request, Response } from 'express';
import _ from 'lodash';

export const getUserProfile = async (req: Request, res: Response) => {
    const userId = 'test';

    const profileData = await User.findById(userId)
        .select(['name', 'email', 'avatar', 'phone', 'role', 'isActive'])
        .lean();
    return {
        data: profileData,
    };
};
