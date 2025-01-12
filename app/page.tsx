'use client'

import {Box, Button, Checkbox, Flex, Group, Modal, NumberInput, rem, TextInput} from '@mantine/core'
import {hasLength, isEmail, useForm} from '@mantine/form'
import {useState} from "react"
import {QRCodeSVG} from "@rc-component/qrcode"
import {useDisclosure} from "@mantine/hooks"
import {IconCheck, IconX} from '@tabler/icons-react'
import {notifications} from '@mantine/notifications'

const price = 285

const sendOrder = async (formValues: {
    zip: string,
    copies: number,
    name: string,
    comment: string,
    termsOfService: boolean,
    email: string
}) => {
    return fetch('/api/sendmail', {
        method: 'POST',
        headers: {},
        body: JSON.stringify(formValues)
    })
}

export default function HomePage() {
    const [opened, {open, close}] = useDisclosure(false)
    const [inProgress, setInProgress] = useState<boolean>(false)
    const [qr, setQr] = useState<string>('')

    const xIcon = <IconX style={{width: rem(20), height: rem(20)}}/>
    const checkIcon = <IconCheck style={{width: rem(20), height: rem(20)}}/>

    const form = useForm({
        mode: 'controlled',
        initialValues: {
            name: '',
            address: '',
            zip: '',
            city: '',
            email: '',
            termsOfService: false,
            copies: 1,
            comment: '',
        },
        validateInputOnBlur: true,
        validate: {
            email: isEmail('Ogiltig email'),
            zip: (value) => (/^\s*(\d\s*){5}$/.test(value) ? null : 'Ogiltigt postnummer'),
            copies: (value) => ((value > 0 && value <= 10) ? null : 'Kolla antalet'),
            name: hasLength({min: 3, max: 50}, 'Ogiltigt namn'),
            comment: hasLength({max: 150}, 'Skriv lite kortare!'),
        },
    })

    return (<>
        <form onSubmit={form.onSubmit((values) => console.log(values))}>
            <TextInput
                withAsterisk
                label="Ditt namn"
                placeholder="För och efternamn"
                key={form.key('name')}
                {...form.getInputProps('name')}
            />
            <TextInput
                withAsterisk
                label="E-post"
                placeholder="din@email.se"
                key={form.key('email')}
                {...form.getInputProps('email')}
            />

            <TextInput
                withAsterisk
                label="Adress"
                placeholder="Gatan 123"
                key={form.key('address')}
                {...form.getInputProps('address')}
            />

            <Group grow={true}>
                <TextInput
                    withAsterisk
                    label="Postnummer"
                    placeholder="Inom Sverige"
                    key={form.key('zip')}
                    {...form.getInputProps('zip')}
                />

                <TextInput
                    withAsterisk
                    label="Ort"
                    placeholder="Storstad"
                    key={form.key('city')}
                    {...form.getInputProps('city')}
                />
            </Group>

            <Group grow={true}>
                <NumberInput
                    label="Antal exemplar"
                    min={1}
                    max={10}
                    key={form.key('copies')}
                    {...form.getInputProps('copies')}
                />
                <Box mt={26}>
                    Total kostnad:
                    <br/>
                    <b>{price * form.getValues().copies} kr</b>
                    <Box fz="xs">(inkl moms och frakt)</Box>
                </Box>
            </Group>

            <TextInput
                label="Dedikation"
                placeholder="Om du vill ha boken dedikerad och signerad skriver du dina önskemål här!"
                key={form.key('comment')}
                {...form.getInputProps('comment')}
            />

            <Group grow={true} mt={20}>
                <div></div>
                <div>
                    <Checkbox
                        mt="md"
                        mb="lg"
                        fz="sm"
                        label="Jag samtycker till att mina uppgifter sparas. Uppgifterna används endast för att skicka dig din beställning och lämnas inte vidare till någon annan part."
                        key={form.key('termsOfService')}
                        {...form.getInputProps('termsOfService', {type: 'checkbox'})}
                    />
                    <Button
                        type="submit"
                        disabled={!form.getValues().termsOfService || !form.isValid()}
                        onClick={() => {
                            setQr(`https://app.swish.nu/1/p/sw/?sw=0708761043&amt=${form.getValues().copies * price}&cur=SEK&msg=${encodeURI('Vargar&Vatten från ' + form.getValues().name)}&src=qr`)
                            open()
                        }}
                    >
                        Betala med Swish
                    </Button>
                </div>
            </Group>
        </form>

        <Modal opened={opened} onClose={close} title="Betala med Swish">
            <Flex direction="column" justify={'center'} align={'center'}>
                <Box fz="md">
                    <a href={qr}>Klicka här</a> eller scanna koden.<br/>
                </Box>
                <QRCodeSVG
                    value={qr}
                    includeMargin={true}
                    size={250}
                />
                <Button loading={inProgress} onClick={async () => {
                    setInProgress(true)
                    const result = await sendOrder(form.getValues())
                    if (!result.ok) {
                        console.error(`Felkod ${result.status} ${result.statusText}`)
                        notifications.show({
                            color: 'red',
                            icon: xIcon,
                            title: 'Det gick inte att skicka beställningen',
                            message: `Felkod ${result.status} ${result.statusText}`,
                            autoClose: false
                        })
                    } else {
                        notifications.show({
                            icon: checkIcon,
                            title: 'Nu är beställningen skickad!',
                            message: `Normalt postas den inom 3-4 dagar.`,
                            autoClose: false
                        })
                        close()
                        form.setValues({
                            name: '',
                            address: '',
                            zip: '',
                            city: '',
                            email: '',
                            termsOfService: false,
                            copies: 1,
                            comment: '',
                        })
                    }
                    setInProgress(false)
                }}>Betalningen är klar!</Button>
            </Flex>
        </Modal>
    </>)
}
