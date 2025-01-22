import {Fragment} from 'react';
import {Dialog, Transition} from '@headlessui/react';
import {HiMiniXMark} from "react-icons/hi2";

export function Modal ({
    heading,
    open = false,
    onClose,
    children
}: {
    heading?: string;
    open: boolean;
    onClose: () => void;
    children: React.ReactNode;
  }) {
    return (
        <Transition appear show={open} as={Fragment}>
            <Dialog as="div" className="relative z-50" onClose={onClose}>
                <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-100"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-100"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-black/50" />
                </Transition.Child>

                <div className="fixed inset-0">
                    <div className="absolute inset-0 overflow-hidden">
                        <div className="fixed inset-y-0 flex w-full justify-center items-center">
                            <Transition.Child
                                as={Fragment}
                                enter="transform transition ease-in-out duration-300"
                                enterFrom="opacity-0"
                                enterTo="opacity-100"
                                leave="transform transition ease-in-out duration-300"
                                leaveFrom="opacity-100"
                                leaveTo="opacity-0"
                            >
                            <Dialog.Panel className="w-md h-96 rounded-md p-12 text-left align-middle transition-all transform shadow-xl bg-white">
                                <header className="sticky top-0 flex items-center h-nav justify-between">
                                    {heading !== null && (
                                        <Dialog.Title>
                                            <span className=''>
                                                {heading}
                                            </span>
                                        </Dialog.Title>
                                    )}
                                    <button
                                        type="button"
                                        className="p-4 -m-4 transition text-primary hover:text-primary/50 cursor-pointer"
                                        onClick={onClose}
                                        data-test="close-drawer"
                                    >
                                        <HiMiniXMark aria-label="Close panel" />
                                    </button>
                                </header>
                                {children}
                            </Dialog.Panel>
                            </Transition.Child>
                        </div>
                    </div>
                </div>
            </Dialog>
        </Transition>
    )
  }
