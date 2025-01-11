'use client'

import {Box, Button, Checkbox, Group, NumberInput, TextInput} from '@mantine/core'
import {useForm} from '@mantine/form'
import {useState} from "react"
import {QRCodeSVG} from "@rc-component/qrcode"

const price = 285

export default function HomePage() {
    const [copies, setCopies] = useState<number>(1)
    const [qr, setQr] = useState<string>('')
    const form = useForm({
        mode: 'uncontrolled',
        initialValues: {
            email: '',
            termsOfService: false,
            count: 1,
            zip: '',
            name: ''
        },

        validate: {
            email: (value) => (/^\S+@\S+$/.test(value) ? null : 'Ogiltig email'),
            zip: (value) => (/^\s*(\d\s*){5}$/.test(value) ? null : 'Ogiltigt postnummer'),
            count: (value) => ((value > 0 && value < 10) ? null : 'Kolla antalet'),
            name: (value) => ((value?.length > 3 && value?.length < 50) ? null : 'Ogiltigt namn'),
        },
    })
    return (
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
                    value={copies} onChange={(v) => {
                    const c = v as number
                    if (c < 1) {
                        setCopies(1)
                        return
                    }
                    if (c > 10) {
                        setCopies(10)
                        return
                    }
                    setCopies(c)
                }}
                />
                <Box mt={26}>
                    Total kostnad (inkl moms och frakt): {price * copies} kr
                </Box>
            </Group>

            <TextInput
                label="Dedikation"
                placeholder="Om du vill ha boken dedikerad och signerad skriver du dina önskemål här!"
                key={form.key('comment')}
                {...form.getInputProps('comment')}
            />

            <Group grow={true} mt={20}>
                <div>
                    {qr && <div>
                        Betala med Swish. <a href={qr}>Klicka här</a> eller scanna koden.<br/>
                        <QRCodeSVG
                            value={qr}
                            includeMargin={true}
                            size={250}
                        />
                    </div>
                    }
                </div>
                <div>
                    <Checkbox
                        mt="md"
                        mb="lg"
                        label="Jag samtycker till att mina uppgifter sparas"
                        key={form.key('termsOfService')}
                        {...form.getInputProps('termsOfService', {type: 'checkbox'})}
                    />
                    <Button
                        type="submit"
                        disabled={!form.getValues().termsOfService}
                        onClick={() => {
                            setQr(`https://app.swish.nu/1/p/sw/?sw=0762042078&amt=${copies * price}&cur=SEK&msg=${form.getValues().name}&src=qr`)
                        }}
                    >
                        Skicka beställning
                    </Button>
                </div>
            </Group>
        </form>
    )
}
