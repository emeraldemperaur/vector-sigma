import { useRef } from 'react';
import { VectorSigma } from '../vectorSigma';
import { XFormType } from '../utils/voltron';

/**
 * VΣ hook to securely initialize and persist a VectorSigma instance 
 * across React re-renders w/out losing internal VΣ tracking state.
 * * @param initializer Optional JSON string, XFormType object, or undefined when constructing xForm schema object by builder methods.
 * @returns Stateful VectorSigma class instance.
 */
export const useVectorSigma = (initializer?: string | XFormType | unknown) => {
    const instanceRef = useRef<VectorSigma | null>(null);

    if (instanceRef.current === null) {
        instanceRef.current = new VectorSigma(initializer);
    }

    return instanceRef.current;
};